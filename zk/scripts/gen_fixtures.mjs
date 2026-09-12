#!/usr/bin/env node
// Generates circuits/<name>/Prover.toml and fixtures/<name>.input.json from
// `nargo execute -p fixture_gen` output. Private inputs come from
// circuits/fixture_gen/Prover.toml verbatim; derived commitment fields are
// patched with the values fixture_gen computed in-circuit.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ZK = join(dirname(fileURLToPath(import.meta.url)), '..');
const GEN_DIR = join(ZK, 'circuits/fixture_gen');

// --- parse "TypeName { key: value, nested: path::Type { ... } }" -----------
function parseStruct(text, i = 0) {
  const obj = {};
  while (i < text.length) {
    while (text[i] === ' ' || text[i] === ',') i++;
    if (text[i] === '}') return [obj, i + 1];
    const m = /^([A-Za-z_][A-Za-z0-9_:]*)\s*:/.exec(text.slice(i));
    if (!m) throw new Error(`parse error at ${i}: ${text.slice(i, i + 40)}`);
    const key = m[1];
    i += m[0].length;
    while (text[i] === ' ') i++;
    if (/[A-Za-z_]/.test(text[i]) && text.slice(i).match(/^[A-Za-z_][A-Za-z0-9_:]*\s*\{/)) {
      const sm = /^[A-Za-z_][A-Za-z0-9_:]*\s*\{/.exec(text.slice(i));
      i += sm[0].length;
      const [nested, ni] = parseStruct(text, i);
      obj[key] = nested;
      i = ni;
    } else {
      const vm = /^[^,}]+/.exec(text.slice(i));
      obj[key] = vm[0].trim();
      i += vm[0].length;
    }
  }
  return [obj, i];
}

// --- minimal TOML reader for our fixture file ------------------------------
function parseToml(text) {
  const root = {};
  let cur = root;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const t = /^\[([^\]]+)\]$/.exec(line);
    if (t) {
      cur = root;
      for (const part of t[1].split('.')) {
        cur[part] = cur[part] || {};
        cur = cur[part];
      }
      continue;
    }
    const kv = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!kv) continue;
    let val = kv[2];
    while ((val.match(/[[{]/g) || []).length > (val.match(/[\]}]/g) || []).length) {
      val += ' ' + lines[++i].trim();
    }
    cur[kv[1]] = parseTomlValue(val);
  }
  return root;
}

function parseTomlValue(s) {
  s = s.trim().replace(/,$/, '');
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s.startsWith('"')) return s.slice(1, -1);
  if (s.startsWith('[')) {
    const inner = s.slice(1, s.lastIndexOf(']')).trim();
    if (!inner) return [];
    return splitTop(inner).map(parseTomlValue);
  }
  if (s.startsWith('{')) {
    const inner = s.slice(1, s.lastIndexOf('}')).trim();
    const o = {};
    for (const part of splitTop(inner)) {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(part.trim());
      o[m[1]] = parseTomlValue(m[2]);
    }
    return o;
  }
  return s;
}

function splitTop(s) {
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '{' || ch === '[') depth++;
    if (ch === '}' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

// --- TOML emit -------------------------------------------------------------
function tomlScalar(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'object') return v; // arrays handled by caller
  return /^0x[0-9a-fA-F]+$/.test(v) ? `"${v}"` : v;
}

function* tomlLines(obj, prefix) {
  const scalars = [], children = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) children.push([k, v]);
    else scalars.push([k, v]);
  }
  for (const [k, v] of scalars) {
    if (Array.isArray(v)) {
      if (v.length && typeof v[0] === 'object') {
        const items = v.map(o =>
          `{ ${Object.entries(o).map(([kk, vv]) => `${kk} = ${tomlScalar(vv)}`).join(', ')} }`,
        );
        yield `${k} = [\n  ${items.join(',\n  ')},\n]`;
      } else {
        yield `${k} = [${v.map(tomlScalar).join(', ')}]`;
      }
    } else {
      yield `${k} = ${tomlScalar(v)}`;
    }
  }
  for (const [k, v] of children) {
    yield `\n[${prefix ? prefix + '.' : ''}${k}]`;
    yield* tomlLines(v, `${prefix ? prefix + '.' : ''}${k}`);
  }
}

// --- main ------------------------------------------------------------------
const out = execSync('nargo execute', { cwd: GEN_DIR, encoding: 'utf8' });
const line = out.split('\n').find(l => l.includes('Circuit output:'));
if (!line) throw new Error('no circuit output');
const body = line.slice(line.indexOf('FixturePublics'));
const open = body.indexOf('{');
const [pub] = parseStruct(body, open + 1);

const inputs = parseToml(readFileSync(join(GEN_DIR, 'Prover.toml'), 'utf8'));

// patch private inputs with in-circuit-computed bindings
inputs.threat_private.approval.claim_draft_commitment = pub.threat_draft;
inputs.threat_private.dlp.claim_draft_commitment = pub.threat_draft;
inputs.risk_private.approval.claim_draft_commitment = pub.risk_draft;
inputs.risk_private.dlp.claim_draft_commitment = pub.risk_draft;
inputs.endorsement_private.local_evidence_opening.leaf.payload_commitment =
  pub.endorsement_assess_payload;

const circuits = ['threat', 'risk', 'endorsement', 'inclusion'];
const names = {
  threat: 'threat_eligibility',
  risk: 'stakeholder_risk_band',
  endorsement: 'peer_endorsement',
  inclusion: 'evidence_inclusion',
};

mkdirSync(join(ZK, 'fixtures'), { recursive: true });
for (const c of circuits) {
  const toml = ['[public]', ...tomlLines(pub[c], 'public'), '', '[private]', ...tomlLines(inputs[`${c}_private`], 'private'), ''].join('\n');
  writeFileSync(join(ZK, `circuits/${names[c]}/Prover.toml`), toml);
  const input = { public: pub[c], private: inputs[`${c}_private`] };
  writeFileSync(join(ZK, `fixtures/${names[c]}.input.json`), JSON.stringify(input, null, 2));
  console.log(`${names[c]}: wrote Prover.toml + fixtures/${names[c]}.input.json`);
}
