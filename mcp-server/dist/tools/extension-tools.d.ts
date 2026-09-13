export interface CreateExtensionParams {
    id: string;
    name: string;
    version?: string;
    description: string;
    cronSchedule?: string;
    primaryLanguage?: "python" | "node" | "bash";
}
export declare function handleCreateExtension(params: CreateExtensionParams): {
    success: boolean;
    error: string;
    attestationPrefix: string;
    message?: undefined;
    manifestPath?: undefined;
} | {
    success: boolean;
    message: string;
    manifestPath: string;
    attestationPrefix: string;
    error?: undefined;
};
export declare function handleValidateExtension(param: string | {
    extensionId?: string;
}): {
    success: boolean;
    error: string;
    attestationPrefix: string;
    extensionId?: undefined;
    errors?: undefined;
    manifest?: undefined;
} | {
    success: boolean;
    extensionId: string;
    errors: string[];
    manifest: any;
    attestationPrefix: string;
    error?: undefined;
};
export declare function handlePackExtension(param: string | {
    extensionId?: string;
}): {
    success: boolean;
    extensionId: string;
    tarballPath: string;
    sizeBytes: number;
    message: string;
    attestationPrefix: string;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    attestationPrefix: string;
    extensionId?: undefined;
    tarballPath?: undefined;
    sizeBytes?: undefined;
    message?: undefined;
};
export declare function handleListExtensions(): {
    success: boolean;
    count: number;
    extensions: {
        id: string;
        name: string;
        cron: string;
        path: string;
    }[];
    attestationPrefix: string;
};
