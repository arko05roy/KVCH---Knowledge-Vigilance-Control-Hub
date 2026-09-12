// GIE-512 invariant registry — whitepaper §4.
//
// 512 deterministic indicator functionals phi_{k,j}: H_k -> {0,1}, four
// orthogonal groups of 128. Each implemented check below carries the exact
// check number and name from the whitepaper taxonomy. Functionals that the
// paper declares but that cannot be evaluated from log/event evidence are
// registered as DECLARED ranges and vacuously pass (bit stays 1); coverage
// is reported honestly by the bench harness.

import { shannonBitsPerByte } from './entropy.js';

export const IMPLEMENTED = [];

function reg(id, name, channels, fn, severity = 'high') {
  IMPLEMENTED.push({ id, name, channels, fn, severity });
}

// ---- shared predicates ---------------------------------------------------

const INJECT =
  /(\bunion\b[\s\S]*\bselect\b)|(\bor\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)|(--\s*$)|(\bdrop\b\s+\btable\b)|(\bsleep\s*\()|(\bexec(\s+|\()xp_)/i;

function balanced(s) {
  let depth = 0, quote = false;
  for (const c of String(s)) {
    if (c === "'") quote = !quote;
    if (!quote) {
      if (c === '(') depth++;
      if (c === ')') { depth--; if (depth < 0) return false; }
    }
  }
  return depth === 0 && !quote;
}

const SHELL_RE = /[;&|`]|\$\(|\|\||&&/;
const TRAVERSAL_RE = /(\.\.[\/\\])|%2e%2e|%252e|\.\.;|\.\.;/i;
const CRLF_RE = /[\r\n]|%0d|%0a/i;
const PROMPT_FRAME_RE = /(<<SYS>>|<\|system\|>|SYSTEM::|\[INST\]|###\s*system)/i;
const TUNNEL_RE = /chisel|ngrok|frp|ligolo|ssh-2\.0|socks5/i;

const SHELLS = /^(\/usr)?\/bin\/(ba|da|z)?sh$|cmd\.exe$|powershell\.exe$/i;
const WORKERS = /^(node|java|python3?|php|ruby|w3wp(\.exe)?|nginx|app)$/i;
const LOLBINS = /^(certutil|bitsadmin|rundll32|regsvr32|mshta|wmic|powershell|msiexec)\.exe$/i;
const SERVICE_PARENTS = /^(w3wp\.exe|node|nginx|java|python3?|app|iis)$/i;

const SYS_WHITELIST = new Set([
  'read', 'write', 'openat', 'close', 'stat', 'fstat', 'newfstatat', 'lseek',
  'poll', 'ppoll', 'epoll_wait', 'epoll_ctl', 'epoll_create1', 'select',
  'recvfrom', 'sendto', 'recvmsg', 'sendmsg', 'socket', 'connect', 'accept4',
  'mmap', 'mprotect', 'munmap', 'brk', 'futex', 'rt_sigreturn',
  'rt_sigaction', 'rt_sigprocmask', 'ioctl', 'access', 'getpid', 'gettid',
  'sched_yield', 'sched_getaffinity', 'getrandom', 'readv', 'writev',
  'pread64', 'pwrite64', 'fsync', 'fdatasync', 'dup', 'dup3', 'pipe2',
  'getdents64', 'getcwd', 'nanosleep', 'clock_nanosleep', 'exit_group',
]);

// Parent -> allowed children (the syscall/process lineage DAG, §3.8).
const LINEAGE = {
  'systemd':          ['dockerd', 'sshd', 'cron', 'systemd-journald', 'journald'],
  'dockerd':          ['containerd-shim', 'docker-proxy'],
  'containerd-shim':  ['app', 'node', 'java', 'python', 'python3', 'nginx'],
  'nginx':            ['nginx'],
  'sshd':             ['bash', 'scp', 'sftp-server'],
  'cron':             ['run-parts', 'sh'],
  'run-parts':        ['sh'],
  'app':              [],
  'node':             [],
  'java':             [],
  'python':           [],
  'python3':          [],
  'w3wp.exe':         [],
};

function isPrivateIP(ip) {
  const p = String(ip).split('.').map(Number);
  if (p.length !== 4 || p.some(Number.isNaN)) return false;
  return p[0] === 10 || p[0] === 127 ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) ||
    (p[0] === 169 && p[1] === 254);
}

const REDIRECT_WHITELIST = new Set([
  'https://app.kvch.internal/oauth/callback',
  'https://web.kvch.internal/auth/return',
]);

const INTERNAL_HOSTS = /\.kvch\.internal$|^kvch\.internal$/;

const field = (f, ...names) => {
  for (const n of names) if (f?.[n] !== undefined) return f[n];
  return undefined;
};

// ============================== GROUP 1 ====================================
// H1: Syntactic AST & formal grammars (checks 1-128)

const LOOKS_SQL = /\b(select|insert|update|delete|union|where|from|drop|exec)\b/i;

reg(1, 'AST leaf immutability', ['db_query', 'http_req'], (f, e, ctx) => {
  const q = field(f, 'query') ?? f.params?.q ?? f.params?.sql;
  if (q === undefined) return true;
  if (!LOOKS_SQL.test(q)) return true;                 // not a query: not our grammar
  if (INJECT.test(q)) return false;                    // operator injected into leaf
  if (ctx.baseline && ctx.baseline.size() > 0) {
    return ctx.baseline.has(q);                        // shape must match a registered template
  }
  return true;
}, 'critical');

reg(2, 'Context-free grammar isomorphism', ['db_query', 'shell_cmd', 'http_req'], (f) => {
  const s = field(f, 'query', 'args') ?? f.params?.q ?? f.params?.cmd;
  if (s === undefined) return true;
  if (f.parse_error === true) return false;
  return balanced(s);
});

reg(3, 'Command lexer delimiter lockout', ['shell_cmd', 'http_req'], (f) => {
  const s = field(f, 'args', 'command') ?? f.params?.cmd ?? f.params?.exec;
  if (s === undefined) return true;
  return !SHELL_RE.test(s);
}, 'critical');

reg(7, 'GraphQL depth/complexity limit', ['gql'], (f) => {
  if (f.depth !== undefined) return f.depth <= 6;
  if (f.query !== undefined) {
    let d = 0, max = 0;
    for (const c of String(f.query)) {
      if (c === '{') { d++; max = Math.max(max, d); }
      if (c === '}') d--;
    }
    return max <= 6;
  }
  return true;
});

reg(12, 'Canonical path traversal barrier', ['file_write', 'http_req', 'file_read'], (f) => {
  const vals = [f.path, ...Object.values(f.params || {})];
  return vals.every((v) => v === undefined || !TRAVERSAL_RE.test(String(v)));
}, 'critical');

reg(13, 'CRLF header injection lock', ['http_req'], (f) => {
  if (!f.headers) return true;
  return Object.values(f.headers).every((v) => !CRLF_RE.test(String(v)));
});

reg(15, 'LLM prompt delimiter isolation', ['llm'], (f) => {
  const user = field(f, 'user', 'prompt');
  if (user === undefined) return true;
  return !PROMPT_FRAME_RE.test(user);
}, 'critical');

reg(16, 'Negative token entropy floor', ['http_req', 'upload'], (f) => {
  const blob = field(f, 'blob', 'body');
  if (blob === undefined) return true;
  const s = String(blob);
  if (s.length < 120) return true;
  return shannonBitsPerByte(s) <= 5.1;
});

// ============================== GROUP 2 ====================================
// H2: Memory & context execution invariants (checks 129-256)

reg(129, 'Hardware taint enforcement', ['taint'], (f) => f.op !== 'rip_from_tainted', 'critical');

reg(130, 'W^X memory invariant', ['mem'], (f) => {
  const p = String(f.prot || '').toUpperCase();
  return !(p.includes('WRITE') && p.includes('EXEC')) && p !== 'RWX' && p !== 'WX';
}, 'critical');

reg(131, 'V8 prototype deep freeze', ['runtime'], (f) => {
  const m = String(f.mutates || '');
  return !/(__proto__|Object\.prototype|Function\.prototype)/.test(m);
}, 'critical');

reg(135, 'AMSI memory tamper guard', ['mem_write'], (f) =>
  String(f.target || '') !== 'amsi.dll!AmsiScanBuffer', 'critical');

reg(136, 'PowerShell CLM enforcement', ['execve'], (f) => {
  const name = String(f.file || f.filename || f.comm || '');
  const args = String(f.args || '');
  if (!/powershell/i.test(name)) return true;
  return !/Add-Type|Reflection\.Assembly|InteropServices|VirtualAlloc|-enc\b/i.test(args);
});

reg(137, 'Stack canary entropy assertion', ['canary'], (f) => f.mismatch !== true, 'critical');

reg(142, 'Dynamic code generation lock', ['runtime'], (f) =>
  !['eval', 'new Function', 'jit_compile', 'Function'].includes(String(f.op)));

// ============================== GROUP 3 ====================================
// H3: Kernel syscall automata (checks 257-384)

reg(257, 'Deterministic syscall whitelisting', ['syscall'], (f) =>
  SYS_WHITELIST.has(String(f.name)));

reg(258, 'Zero shell from web workers', ['execve'], (f) => {
  const comm = String(f.comm || '');
  const file = String(f.file || f.filename || '');
  if (!WORKERS.test(comm)) return true;
  return !SHELLS.test(file);
}, 'critical');

// bprm_check_security convention (Appendix B): comm = calling (parent)
// process name, file = target binary being exec'd. Edge = comm -> basename(file).
reg(259, 'Parent-child ancestry lineage', ['execve'], (f) => {
  const parent = String(f.comm || '');
  const child = String(f.file || f.filename || '').split('/').pop().split('\\').pop();
  if (!(parent in LINEAGE)) return true;      // unmodelled parent: not asserted here
  return LINEAGE[parent].includes(child);
}, 'critical');

reg(260, 'LOLBins execution lock', ['execve'], (f) => {
  const file = String(f.file || f.filename || '').split('/').pop().split('\\').pop();
  if (!LOLBINS.test(file)) return true;
  return !SERVICE_PARENTS.test(String(f.ppid || f.parent || f.comm || ''));
}, 'critical');

reg(261, 'Landlock LSM path jailing', ['file_write'], (f) => {
  const p = String(f.path || '');
  if (!p) return true;
  return /^\/(app\/(data|logs)|tmp)\//.test(p);
});

reg(262, 'Immutable root filesystem', ['file_write'], (f) => {
  const p = String(f.path || '');
  return !/^\/(etc|usr|bin|sbin|boot|lib|root|opt)\//.test(p) && p !== '/';
}, 'critical');

reg(264, 'Kernel capability dropping', ['cap'], (f) =>
  !['CAP_SYS_ADMIN', 'CAP_NET_RAW', 'CAP_PTRACE', 'CAP_SYS_MODULE', 'CAP_DAC_OVERRIDE']
    .includes(String(f.cap)));

reg(265, 'Process hollowing prevention', ['ptrace', 'syscall'], (f) =>
  !['ptrace', 'process_vm_writev', 'process_vm_readv'].includes(String(f.name || f.op || 'ptrace')),
  'critical');

reg(266, 'WMI namespace write lock', ['wmi'], (f) =>
  !['__EventFilter', 'CommandLineEventConsumer', '__IntervalTimerInstruction']
    .includes(String(f.class)));

reg(267, 'File descriptor bound assertion', ['fd'], (f) => Number(f.count ?? 0) <= 4096);

reg(268, 'Raw socket creation sandbox', ['socket'], (f) =>
  !['SOCK_RAW', 'SOCK_PACKET', 'AF_PACKET'].includes(String(f.type)));

reg(269, 'Process identity immutability', ['setuid', 'setgid'], (f) => {
  const v = Number(f.uid ?? f.gid ?? -1);
  return v === -1;
}, 'critical');

reg(270, 'Kernel module freeze', ['module'], () => false, 'critical'); // any load = defect

reg(272, 'Hardware TPM 2.0 attestation', ['tpm'], (f) => f.pcr_ok !== false);

// ============================== GROUP 4 ====================================
// H4: Transport & cryptographic state vectors (checks 385-512)

reg(385, 'DPoP hardware token binding', ['http_req'], (f) => {
  const auth = String(f.headers?.authorization || '');
  if (!auth.startsWith('Bearer')) return true;
  return Boolean(f.headers?.dpop);
}, 'critical');

reg(386, 'Strict PKCE enforcement', ['oauth'], (f) => {
  if (f.flow !== 'authorize') return true;
  return Boolean(f.code_challenge) && f.challenge_method === 'S256';
});

reg(387, 'Exact-byte redirect whitelist', ['oauth'], (f) => {
  if (!f.redirect_uri) return true;
  return REDIRECT_WHITELIST.has(String(f.redirect_uri));
}, 'critical');

reg(388, 'L7 protocol conformance', ['flow', 'connect'], (f) => {
  if (Number(f.dport) !== 443) return true;
  return ['tls', 'http1.1', 'h2', 'h3'].includes(String(f.proto));
}, 'critical');

reg(389, 'Reverse tunnel frame rejection', ['flow', 'connect'], (f) =>
  !TUNNEL_RE.test(String(f.banner || f.payload || '')), 'critical');

reg(390, 'DNS entropy & volume invariant', ['dns'], (f) => {
  const q = String(f.qname || '');
  if (!q) return true;
  const label = q.split('.')[0];
  if (String(f.qtype).toUpperCase() === 'NULL') return false;
  if (label.length > 52) return false;
  return shannonBitsPerByte(label) <= 4.5;
}, 'critical');

reg(391, 'ICMP payload restriction', ['icmp'], (f) => Number(f.payload_len ?? 0) <= 64);

reg(392, 'JA4 / TLS fingerprint binding', ['session'], (f) =>
  !f.ja4_initial || String(f.ja4) === String(f.ja4_initial));

reg(394, 'Strict host header matching', ['http_req'], (f) => {
  if (!f.host) return true;
  return INTERNAL_HOSTS.test(String(f.host));
});

reg(395, 'SSRF private IP range invariant', ['connect'], (f) => {
  const d = String(f.daddr || '');
  if (!isPrivateIP(d)) return true;
  if (d === '169.254.169.254' || d.startsWith('127.')) return false;
  return f.worker !== true;   // RFC1918 blocked only for web-worker egress
}, 'critical');

reg(396, 'CORS explicit origin locking', ['http_resp'], (f) => {
  const acao = String(f.headers?.['access-control-allow-origin'] || '');
  const acac = String(f.headers?.['access-control-allow-credentials'] || '');
  return !(acao === '*' && acac.toLowerCase() === 'true');
});

reg(397, 'Flow asymmetry duration invariant', ['flow'], (f) =>
  !(Number(f.bytes_in ?? 0) > 1_000_000 && Number(f.req_count ?? 0) === 0));

reg(398, 'WebSocket frame masking', ['ws'], (f) => f.masked_ok !== false);

reg(400, 'Anti-replay nonce monotonicity', ['http_req', 'oauth'], (f, e, ctx) => {
  if (f.nonce === undefined) return true;
  return !ctx.seenNonce(String(f.key || f.host || 'global'), String(f.nonce), e.ts);
});

// ======================= declared-but-unevaluated ==========================
// Whitepaper ranges whose functionals need inline/kernel/runtime evidence
// this log-filter build cannot observe; they hold bit=1 (vacuous pass).

export const DECLARED = [
  [4, 'JSON primitive coercion guard'], [5, 'LDAP/XPath parenthesis depth'],
  [6, 'XXE disablement'], [8, 'Regex linear-time automata'],
  [9, 'Deserialization class whitelist'], [10, 'SSTI template shield'],
  [11, 'HTML/DOM mutation isolation'], [14, 'Unicode NFKC normalization'],
  [[17, 32], 'Relational & document query dialects'],
  [[33, 64], 'Serialization protocols'],
  [[65, 96], 'Template & expression language isolation'],
  [[97, 128], 'Markup & web document grammars'],
  [[132, 134], 'Module sandbox / CFI / shadow stack'],
  [[138, 141], 'ASLR / heap guard / PAC / token binding'],
  [[143, 144], 'Zero-fill / speculative barriers'],
  [[145, 176], 'Runtime VM sandboxes'],
  [[177, 208], 'Binary hardening & exploit mitigation'],
  [[209, 256], 'Microarchitectural side-channel shields'],
  [263, 'NoExec temporary mounts'], [271, 'Core dump scrubbing'],
  [[273, 304], 'LSM policies (AppArmor/SELinux/BPF-LSM/Smack)'],
  [[305, 336], 'Container & namespace hardening'],
  [[337, 384], 'Kernel resource limits & watchdogs'],
  [393, 'mTLS service mesh mutual auth'], [399, 'Stateless TCP SYN cookies'],
  [[401, 432], 'TLS & transport layer controls'],
  [[433, 464], 'HTTP/2 & HTTP/3 protocol defenses'],
  [[465, 512], 'Routing & wire encryption invariants'],
];

export function declaredCount() {
  let n = 0;
  for (const d of DECLARED) {
    n += Array.isArray(d[0]) ? d[0][1] - d[0][0] + 1 : 1;
  }
  return n;
}

export function groupOf(id) { return Math.floor((id - 1) / 128) + 1; }
