import "server-only";
import Groq from "groq-sdk";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export class GroqKeyPoolManager {
  private keys: string[] = [];
  private currentIndex: number = 0;
  private coolDowns: Map<string, number> = new Map();

  constructor() {
    this.reloadKeys();
  }

  /** Read keys exclusively from server-side environment variables or .env.local */
  public reloadKeys(): void {
    let rawKeys = process.env.GROQ_API_KEYS || "";

    // Fallback: parse .env.local or .env if running outside Next.js process wrapper
    if (!rawKeys) {
      for (const envFile of [".env.local", ".env"]) {
        const envPath = path.join(process.cwd(), envFile);
        if (existsSync(envPath)) {
          try {
            const content = readFileSync(envPath, "utf8");
            const match = content.match(/GROQ_API_KEYS\s*=\s*["']?([^"'\r\n]+)["']?/);
            if (match) {
              rawKeys = match[1];
              break;
            }
          } catch {
            // Ignore read errors
          }
        }
      }
    }

    const parsedList = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);

    // Fallback to individual env vars if set
    for (let i = 1; i <= 10; i++) {
      const singleKey = process.env[`GROQ_API_KEY_${i}`] || process.env.GROQ_API_KEY;
      if (singleKey && !parsedList.includes(singleKey)) {
        parsedList.push(singleKey);
      }
    }

    this.keys = Array.from(new Set(parsedList));
  }

  /** Gets next non-cooldowned key */
  private getNextClient(): { client: Groq; keyIndex: number; key: string } {
    if (this.keys.length === 0) {
      this.reloadKeys();
      if (this.keys.length === 0) {
        throw new Error("No Groq API keys configured in environment variables (GROQ_API_KEYS).");
      }
    }

    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const index = (this.currentIndex + i) % this.keys.length;
      const key = this.keys[index];
      const cooldownExpiry = this.coolDowns.get(key) || 0;

      if (now >= cooldownExpiry) {
        this.currentIndex = (index + 1) % this.keys.length;
        return { client: new Groq({ apiKey: key }), keyIndex: index, key };
      }
    }

    // If all keys are in cooldown, pick the one closest to expiry
    let minExpiry = Infinity;
    let bestKey = this.keys[0];
    for (const key of this.keys) {
      const expiry = this.coolDowns.get(key) || 0;
      if (expiry < minExpiry) {
        minExpiry = expiry;
        bestKey = key;
      }
    }

    return { client: new Groq({ apiKey: bestKey }), keyIndex: 0, key: bestKey };
  }

  /** Generate chat completion with failover retry across the key pool */
  async createCompletion(params: Groq.Chat.CompletionCreateParamsNonStreaming): Promise<Groq.Chat.Completions.ChatCompletion> {
    let lastError: unknown;
    const maxAttempts = Math.max(this.keys.length, 1);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { client, key } = this.getNextClient();
      try {
        return await client.chat.completions.create(params);
      } catch (error: any) {
        lastError = error;
        const statusCode = error?.status || error?.statusCode;
        
        // Handle rate limits (429) or transient server errors (5xx)
        if (statusCode === 429 || (statusCode >= 500 && statusCode < 600)) {
          this.coolDowns.set(key, Date.now() + 60000); // 60s cooldown
          console.warn(`[Groq Key Pool] Key ending in ...${key.slice(-6)} hit ${statusCode}. Retrying with next key (Attempt ${attempt + 1}/${maxAttempts})`);
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }
}

export const groqPool = new GroqKeyPoolManager();
