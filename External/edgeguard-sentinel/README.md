# EdgeGuard-Sentinel Extension

CDN, WAF & Origin IP Firewall Shield for KVCH.
Monitors outgoing HTTP requests and inbound response headers (`cf-ray`, `x-amz-cf-id`, CORS, CSP), runs localized non-destructive micro-fuzzing loops against staging/edge routing endpoints, blocks backend origin IP leaks, and provides automated WAF rule patching.
