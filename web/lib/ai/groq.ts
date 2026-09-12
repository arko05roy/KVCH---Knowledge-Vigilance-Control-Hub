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
    let bestIndex = 0;
    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      const expiry = this.coolDowns.get(key) || 0;
      if (expiry < minExpiry) {
        minExpiry = expiry;
        bestKey = key;
        bestIndex = i;
      }
    }

    this.currentIndex = (bestIndex + 1) % this.keys.length;
    return { client: new Groq({ apiKey: bestKey }), keyIndex: bestIndex, key: bestKey };
  }

  /** Extract delay from 429 error message (e.g. "try again in 176ms") or compute exponential backoff */
  private getRetryDelayMs(error: any, attempt: number): number {
    const errorMsg = String(error?.message || error?.error?.error?.message || "");
    const match = errorMsg.match(/try again in (\d+)(ms|s)/i);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const delay = unit === "s" ? amount * 1000 : amount;
      return Math.min(Math.max(delay + 100, 300), 5000);
    }

    // Exponential backoff: 600ms, 1200ms, 2400ms...
    return Math.min(600 * Math.pow(1.8, attempt), 4000);
  }

  /** Generate chat completion with failover retry across the key pool and smart rate-limit backoff */
  async createCompletion(params: any): Promise<any> {
    let lastError: unknown;
    // Allow up to 6 retry attempts to handle rate limit resets
    const maxAttempts = Math.max(this.keys.length * 2, 6);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { client, key } = this.getNextClient();

      // Fallback model if primary model repeatedly hits rate limits
      const requestParams = { ...params };
      if (attempt >= 3 && requestParams.model === "groq/compound") {
        requestParams.model = "llama-3.1-8b-instant";
      }

      try {
        return (await client.chat.completions.create({ ...requestParams, stream: false })) as Groq.Chat.Completions.ChatCompletion;
      } catch (error: any) {
        lastError = error;
        const statusCode = error?.status || error?.statusCode;

        // Handle rate limits (429) or transient server errors (5xx)
        if (statusCode === 429 || (statusCode >= 500 && statusCode < 600)) {
          const delayMs = this.getRetryDelayMs(error, attempt);
          // Set short cooldown (3s for 429, 10s for 5xx) so keys don't stay locked for a full minute
          const cooldownDuration = statusCode === 429 ? 3000 : 10000;
          this.coolDowns.set(key, Date.now() + cooldownDuration);

          console.warn(
            `[Groq Key Pool] Key ending in ...${key.slice(-6)} hit ${statusCode}. Waiting ${delayMs}ms before retry (Attempt ${attempt + 1}/${maxAttempts})...`
          );

          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }
}

export const groqPool = new GroqKeyPoolManager();
