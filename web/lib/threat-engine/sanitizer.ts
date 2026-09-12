/**
 * Telemetry Field Sanitizer (Section 7)
 * Strips and neutralizes control characters, prompt injection directives,
 * and malicious formatting from attacker-influenced telemetry strings before LLM ingestion.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /you\s+are\s+now\s+/gi,
  /system\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /```/g,
];

export function sanitizeTelemetryString(input: string | null | undefined): { sanitized: string; wasModified: boolean } {
  if (!input) return { sanitized: "", wasModified: false };

  let text = String(input);
  let wasModified = false;

  // 1. Remove dangerous unprintable control chars (except standard space)
  const cleanChars = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  if (cleanChars !== text) {
    text = cleanChars;
    wasModified = true;
  }

  // 2. Neutralize prompt-injection triggers
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      text = text.replace(pattern, "[FILTERED_INJECTION_DIRECTIVE]");
      wasModified = true;
    }
  }

  // 3. Truncate extreme length strings (e.g. buffer overflow attempts in process names)
  if (text.length > 500) {
    text = text.substring(0, 500) + "...[TRUNCATED]";
    wasModified = true;
  }

  return { sanitized: text.trim(), wasModified };
}

export function sanitizeObjectFields<T extends Record<string, any>>(
  obj: T,
  fieldKeys: string[]
): { sanitizedObj: T; modifiedFields: string[] } {
  const result = { ...obj } as any;
  const modifiedFields: string[] = [];

  for (const key of fieldKeys) {
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      if (result[parent] && typeof result[parent][child] === "string") {
        const { sanitized, wasModified } = sanitizeTelemetryString(result[parent][child]);
        result[parent] = { ...result[parent], [child]: sanitized };
        if (wasModified) modifiedFields.push(key);
      }
    } else if (typeof result[key] === "string") {
      const { sanitized, wasModified } = sanitizeTelemetryString(result[key]);
      result[key] = sanitized;
      if (wasModified) modifiedFields.push(key);
    }
  }

  return { sanitizedObj: result, modifiedFields };
}
