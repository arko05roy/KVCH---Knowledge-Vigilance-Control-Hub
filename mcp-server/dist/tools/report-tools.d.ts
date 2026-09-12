export interface GetSecurityReportsParams {
    role?: "sr-dev" | "intern" | "hr" | "management" | "all";
    fingerprintPrefix?: string;
    format?: "markdown" | "json";
}
export declare function handleGetSecurityReports(params: GetSecurityReportsParams): {
    success: boolean;
    error: string;
    expectedPrefix: string;
    providedPrefix: string;
    attestationPrefix?: undefined;
    role?: undefined;
    format?: undefined;
    content?: undefined;
} | {
    success: boolean;
    error: string;
    attestationPrefix: string;
    expectedPrefix?: undefined;
    providedPrefix?: undefined;
    role?: undefined;
    format?: undefined;
    content?: undefined;
} | {
    success: boolean;
    role: string;
    format: "markdown" | "json";
    content: any;
    attestationPrefix: string;
    error?: undefined;
    expectedPrefix?: undefined;
    providedPrefix?: undefined;
};
