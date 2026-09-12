export interface RunSandboxScanParams {
    durationMinutes?: number;
    targetedExtensions?: string[];
    simulatedVectors?: string[];
}
export declare function handleRunSandboxScan(params: RunSandboxScanParams): {
    success: boolean;
    message: string;
    scanResult: {
        scanId: string;
        status: string;
        durationMinutes: number;
        extensionsRun: string[];
        threatsDetected: number;
        criticalInterceptions: string[];
        soarStatus: string;
        attestationPrefix: string;
    };
    attestationPrefix: string;
};
export interface ExecuteSoarParams {
    action: "kill_process" | "quarantine_ip" | "purge_persistence" | "full_quarantine";
    pid?: number;
    ip?: string;
}
export declare function handleExecuteSoar(params: ExecuteSoarParams): {
    success: boolean;
    message: string;
    execution: {
        executionId: string;
        action: "kill_process" | "quarantine_ip" | "purge_persistence" | "full_quarantine";
        commandsExecuted: string[];
        status: string;
        hostReturnedToCleanBaseline: boolean;
        timestamp: string;
        attestationPrefix: string;
    };
    attestationPrefix: string;
};
