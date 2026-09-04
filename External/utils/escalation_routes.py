#!/usr/bin/env python3
"""Escalation route configuration for KVCH"""

# Escalation routes for different finding types
ESCALATION_ROUTES = {
    'open_port': ['security_analyst', 'network_engineer', 'ciso'],
    'ssl_issue': ['security_analyst', 'network_engineer'],
    'exposed_bucket': ['security_analyst', 'cloud_engineer', 'ciso'],
    'phishing_domain': ['security_analyst', 'ciso'],
    'ddos_attack': ['security_analyst', 'network_engineer', 'ciso', 'cto'],
    'malware_detected': ['security_analyst', 'incident_response', 'ciso'],
    'weak_encryption': ['security_analyst', 'network_engineer'],
    'default': ['security_analyst']
}

# Role-specific report configurations
ROLE_REPORTS = {
    'security_analyst': {
        'include_technical': True,
        'include_evidence': True,
        'include_recommendations': True,
        'include_sensitive': False
    },
    'network_engineer': {
        'include_technical': True,
        'include_evidence': True,
        'include_recommendations': True,
        'include_sensitive': False
    },
    'ciso': {
        'include_technical': False,
        'include_evidence': False,
        'include_recommendations': True,
        'include_sensitive': False,
        'include_business_impact': True
    },
    'cto': {
        'include_technical': False,
        'include_evidence': False,
        'include_recommendations': True,
        'include_sensitive': False,
        'include_business_impact': True
    }
}

def get_escalation_route(finding_type: str):
    """Get escalation route for a finding type"""
    return ESCALATION_ROUTES.get(finding_type, ESCALATION_ROUTES['default'])

def get_role_report_config(role: str):
    """Get report configuration for a role"""
    return ROLE_REPORTS.get(role, ROLE_REPORTS['security_analyst'])