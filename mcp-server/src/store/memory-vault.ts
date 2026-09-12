import { generateHostFingerprint } from "../fingerprint/signer.js";

export interface VaultRecord<T = unknown> {
  id: string;
  fingerprintPrefix: string;
  category: string;
  data: T;
  createdAt: string;
}

/**
 * In-memory / persistent vault that indexes and retrieves records
 * STRICTLY based on the attested host fingerprint prefix.
 */
export class FingerprintIndexedVault {
  private records: Map<string, VaultRecord> = new Map();

  /**
   * Stores a record tagged with the caller's unique fingerprint prefix.
   */
  public store<T>(id: string, category: string, data: T, fingerprintPrefix?: string): VaultRecord<T> {
    const activeFp = fingerprintPrefix || generateHostFingerprint().prefix;
    const record: VaultRecord<T> = {
      id,
      fingerprintPrefix: activeFp,
      category,
      data,
      createdAt: new Date().toISOString(),
    };
    this.records.set(id, record as VaultRecord);
    return record;
  }

  /**
   * Retrieves a record ONLY if the caller's fingerprint prefix matches.
   */
  public get<T>(id: string, callerFingerprintPrefix?: string): { success: boolean; data?: T; error?: string } {
    const record = this.records.get(id);
    if (!record) {
      return { success: false, error: `Record ${id} not found` };
    }

    const expectedFp = callerFingerprintPrefix || generateHostFingerprint().prefix;
    if (record.fingerprintPrefix !== expectedFp) {
      return {
        success: false,
        error: `403 FORBIDDEN: Record ${id} is locked to fingerprint ${record.fingerprintPrefix}. Caller fingerprint mismatch.`,
      };
    }

    return { success: true, data: record.data as T };
  }

  /**
   * Lists records filtered by category and matching the caller's fingerprint prefix.
   */
  public listByCategory<T>(category: string, callerFingerprintPrefix?: string): VaultRecord<T>[] {
    const expectedFp = callerFingerprintPrefix || generateHostFingerprint().prefix;
    const matches: VaultRecord<T>[] = [];

    for (const record of this.records.values()) {
      if (record.category === category && record.fingerprintPrefix === expectedFp) {
        matches.push(record as VaultRecord<T>);
      }
    }

    return matches;
  }
}

export const globalVault = new FingerprintIndexedVault();
