export function inspectEvent(event: { content: string }): string[] {
  return /api[_-]?key\s*=\s*[^\s]+/i.test(event.content) ? ["secret-like value"] : [];
}
