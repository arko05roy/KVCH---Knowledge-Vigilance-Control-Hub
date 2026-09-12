import { generateHostFingerprint } from "../fingerprint/signer.js";
/**
 * In-memory / persistent vault that indexes and retrieves records
 * STRICTLY based on the attested host fingerprint prefix.
 */
export class FingerprintIndexedVault {
    records = new Map();
    /**
     * Stores a record tagged with the caller's unique fingerprint prefix.
     */
    store(id, category, data, fingerprintPrefix) {
        const activeFp = fingerprintPrefix || generateHostFingerprint().prefix;
        const record = {
            id,
            fingerprintPrefix: activeFp,
            category,
            data,
            createdAt: new Date().toISOString(),
        };
        this.records.set(id, record);
        return record;
    }
    /**
     * Retrieves a record ONLY if the caller's fingerprint prefix matches.
     */
    get(id, callerFingerprintPrefix) {
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
        return { success: true, data: record.data };
    }
    /**
     * Lists records filtered by category and matching the caller's fingerprint prefix.
     */
    listByCategory(category, callerFingerprintPrefix) {
        const expectedFp = callerFingerprintPrefix || generateHostFingerprint().prefix;
        const matches = [];
        for (const record of this.records.values()) {
            if (record.category === category && record.fingerprintPrefix === expectedFp) {
                matches.push(record);
            }
        }
        return matches;
    }
}
export const globalVault = new FingerprintIndexedVault();
