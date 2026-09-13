export interface GetMlInsightsParams {
    query_type: "general_info" | "host_tailored";
    format?: "markdown" | "json";
}
/**
 * Returns ML predictive insights:
 * 1. "general_info": Global aggregate model benchmarks independent of host architecture.
 * 2. "host_tailored": Filtered and customized strictly to the host's 5-layer attestation profile (OS, Network, Transport, TLS, RAM).
 */
export declare function handleGetMlInsights(params: GetMlInsightsParams): {
    success: boolean;
    mode: "general_info";
    data: {
        insight_mode: string;
        target_scope: string;
        model_metadata: {
            model_version: string;
            training_corpus: string;
            confidence_interval: string;
            last_trained: string;
        };
        global_threat_patterns: {
            pattern_id: string;
            category: string;
            frequency_score: number;
            impact_rating: string;
            generic_remediation: string;
        }[];
        macro_health_index: {
            fleet_compliance_pct: number;
            mean_time_to_detect_seconds: number;
            active_sandboxed_extensions: number;
        };
        note: string;
        attestation_prefix: string;
    };
    content?: undefined;
    attestationPrefix?: undefined;
} | {
    success: boolean;
    mode: "general_info";
    content: string;
    attestationPrefix: string;
    data?: undefined;
} | {
    success: boolean;
    mode: "host_tailored";
    data: {
        insight_mode: string;
        target_scope: string;
        computed_fingerprint: {
            envelope: string;
            prefix: string;
            timestamp: number;
            layers_hash: string;
        };
        host_layer_telemetry: {
            layer1_os: {
                platform: string;
                release: string;
                arch: string;
                cpu_model: string;
                hardware_uuid: string;
            };
            layer2_network: {
                primary_interface: string;
                ip_v4: string;
                subnet_mask: string;
                mac_hash: string;
            };
            layer3_transport: {
                active_sockets_hash: string;
                listening_ports_count: number;
            };
            layer4_presentation: {
                tls_ssl_version: string;
                crypto_curves_profile: string;
                system_language: string;
            };
            layer5_memory: {
                physical_ram_gb: string;
                heap_allocated_mb: string;
                memory_signature: string;
            };
        };
        tailored_ml_findings: {
            layer: string;
            status: string;
            finding: string;
            action: string;
        }[];
    };
    content?: undefined;
    attestationPrefix?: undefined;
} | {
    success: boolean;
    mode: "host_tailored";
    content: string;
    attestationPrefix: string;
    data?: undefined;
};
