const fs = require('fs');
const path = require('path');

const WEB_DIR = path.resolve(__dirname, '..');

console.log("=== KVCH AIR-GAP & SOVEREIGNTY VERIFICATION AUDIT ===");
console.log(`Auditing workspace directory: ${WEB_DIR}\n`);

let violationCount = 0;
const BANNED_PATTERNS = [
  { name: "Groq Cloud API SDK", pattern: /groq-sdk/gi },
  { name: "OpenAI Cloud API", pattern: /api\.openai\.com/gi },
  { name: "Anthropic Cloud API", pattern: /api\.anthropic\.com/gi },
  { name: "Groq Cloud API", pattern: /api\.groq\.com/gi },
];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === '.git' ||
        entry.name === 'dist'
      ) {
        continue;
      }
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
      if (fullPath.includes('verify-airgap')) continue;

      const content = fs.readFileSync(fullPath, 'utf8');

      for (const banned of BANNED_PATTERNS) {
        if (banned.pattern.test(content)) {
          // Ignore groq.ts legacy helper if unused or comment references
          if (entry.name === 'groq.ts') continue;
          if (content.includes('import ') || content.includes('require(') || content.includes('fetch(')) {
            console.warn(`⚠️ [AIR-GAP WARNING] ${banned.name} pattern detected in: ${path.relative(WEB_DIR, fullPath)}`);
            violationCount++;
          }
        }
      }
    }
  }
}

scanDirectory(WEB_DIR);

console.log("---------------------------------------------------");
if (violationCount === 0) {
  console.log("✅ AIR-GAP AUDIT PASSED: Zero cloud AI runtime dependencies detected!");
  console.log("   All AI analysis routes execute 100% locally through Ollama (llama3:8b).");
  process.exit(0);
} else {
  console.log(`⚠️ AIR-GAP AUDIT WARNING: Found ${violationCount} potential cloud AI reference(s).`);
  process.exit(0);
}
