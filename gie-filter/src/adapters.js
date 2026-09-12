// Per-source adapters: heterogeneous raw log line -> normalized event.
//
// The filtration layer does NOT force one input schema. Each adapter is a
// thin field-extractor for one source format; whatever the source, output
// is a uniform event { ts, host, src, channel, fields, raw, ref }.
// Unrecognized lines become 'deadletter' events (counted, never crash).

const ACCESS_RE =
  /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) ([^ "]*?) HTTP\/[\d.]+" (\d{3}) (\d+)(?:\s+host=(\S+))?/;
const SYSLOG_RE =
  /^<(\d+)>([A-Z][a-z]{2})\s+(\d+) ([\d:]+) (\S+) (\S+?)(?:\[(\d+)\])?: (.*)$/;
const DNS_RE = /^dns ts=(\S+) src=(\S+) qname=(\S+) qtype=(\S+)/;

function safeTs(d) {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? new Date().toISOString() : t.toISOString();
}

function jsonEvent(obj, ref) {
  const channel = obj.evt || obj.t;
  if (!channel) return null;
  const { evt, t, ts, host, src, ...fields } = obj;
  return {
    ts: ts || new Date().toISOString(),
    host: host || 'unknown',
    src: src || 'ebpf',
    channel,
    fields,
    raw: JSON.stringify(obj),
    ref,
  };
}

function adaptAccess(m, ref) {
  const [, ip, ts, method, uri, status, bytes, host] = m;
  const [path, qs] = uri.split('?');
  const params = {};
  if (qs) {
    for (const [k, v] of new URLSearchParams(qs)) params[k] = v;
  }
  return {
    ts: safeTs(ts),
    host: host || 'unknown',
    src: 'access',
    channel: 'http_req',
    fields: { method, path, params, ip, status: Number(status), bytes: Number(bytes), host },
    raw: m[0],
    ref,
  };
}

function adaptSyslog(m, ref) {
  const [, , mon, day, time, host, proc, pid, msg] = m;
  const ts = safeTs(`${mon} ${day} 2026 ${time}`);
  const cmd = msg.match(/COMMAND=(.*)$/);
  if (cmd) {
    return {
      ts, host, src: 'syslog', channel: 'shell_cmd',
      fields: { comm: proc, args: cmd[1].trim(), pid },
      raw: m[0], ref,
    };
  }
  return {
    ts, host, src: 'syslog', channel: 'generic',
    fields: { proc, pid, msg }, raw: m[0], ref,
  };
}

function adaptJournald(line, ref) {
  const kv = {};
  for (const tok of line.split(/\s+/)) {
    const i = tok.indexOf('=');
    if (i > 0) kv[tok.slice(0, i)] = tok.slice(i + 1);
  }
  const host = kv._HOSTNAME || 'unknown';
  const msg = kv.MESSAGE || '';
  const cmd = msg.match(/COMMAND=(.*)$/) || (kv.COMMAND ? [null, kv.COMMAND] : null);
  if (cmd) {
    return {
      ts: new Date().toISOString(), host, src: 'journald', channel: 'shell_cmd',
      fields: { comm: kv._COMM, args: cmd[1].trim() }, raw: line, ref,
    };
  }
  return {
    ts: new Date().toISOString(), host, src: 'journald', channel: 'generic',
    fields: { comm: kv._COMM, msg }, raw: line, ref,
  };
}

function adaptDns(m, ref) {
  const [, ts, src, qname, qtype] = m;
  return {
    ts: safeTs(ts), host: src, src: 'dnslog', channel: 'dns',
    fields: { qname, qtype, src_ip: src }, raw: m[0], ref,
  };
}

export function adapt(line, ref) {
  const s = line.trim();
  if (!s) return null;

  if (s[0] === '{') {
    try {
      const obj = JSON.parse(s);
      if (obj.log !== undefined && obj.stream !== undefined) {
        // Docker JSON envelope: unwrap and re-dispatch the inner message;
        // unrecognized inner text is container stdout, not garbage.
        const inner = adapt(String(obj.log).trim(), ref);
        if (inner && inner.channel !== 'deadletter') {
          inner.src = 'docker'; inner.host = obj.attrs?.host || inner.host; return inner;
        }
        return {
          ts: obj.time || new Date().toISOString(), host: obj.attrs?.host || 'unknown',
          src: 'docker', channel: 'app_log', fields: { msg: String(obj.log).trim() },
          raw: s, ref,
        };
      }
      const evt = jsonEvent(obj, ref);
      if (evt) return evt;
      return { ts: new Date().toISOString(), host: 'unknown', src: 'json', channel: 'deadletter', fields: {}, raw: s, ref };
    } catch {
      return { ts: new Date().toISOString(), host: 'unknown', src: 'json', channel: 'deadletter', fields: {}, raw: s, ref };
    }
  }

  let m;
  if ((m = s.match(ACCESS_RE))) return adaptAccess(m, ref);
  if ((m = s.match(DNS_RE))) return adaptDns(m, ref);
  if ((m = s.match(SYSLOG_RE))) return adaptSyslog(m, ref);
  if (/^\w+=\S+/.test(s)) return adaptJournald(s, ref);

  // Free-form application text: parseable line, just no structured checks.
  return { ts: new Date().toISOString(), host: 'unknown', src: 'text', channel: 'app_log', fields: { msg: s }, raw: s, ref };
}
