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
export declare class FingerprintIndexedVault {
    private records;
    /**
     * Stores a record tagged with the caller's unique fingerprint prefix.
     */
    store<T>(id: string, category: string, data: T, fingerprintPrefix?: string): VaultRecord<T>;
    /**
     * Retrieves a record ONLY if the caller's fingerprint prefix matches.
     */
    get<T>(id: string, callerFingerprintPrefix?: string): {
        success: boolean;
        data?: T;
        error?: string;
    };
    /**
     * Lists records filtered by category and matching the caller's fingerprint prefix.
     */
    listByCategory<T>(category: string, callerFingerprintPrefix?: string): VaultRecord<T>[];
}
export declare const globalVault: FingerprintIndexedVault;
