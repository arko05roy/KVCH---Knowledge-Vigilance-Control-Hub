#!/usr/bin/env python3
"""Unified report generator"""

import json
import os
from datetime import datetime

def generate_unified_report(extension_results, target):
    """Generate a unified report from all extensions"""
    
    report = {
        'target': target,
        'timestamp': datetime.now().isoformat(),
        'extensions': extension_results,
        'overall_risk': calculate_overall_risk(extension_results)
    }
    
    os.makedirs('../reports', exist_ok=True)
    filename = f"../reports/unified_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(filename, 'w') as f:
        json.dump(report, f, indent=2)
    
    return filename

def calculate_overall_risk(extension_results):
    """Calculate overall risk from all extensions"""
    total_risk = 0
    count = 0
    
    for result in extension_results:
        if 'risk_score' in result:
            total_risk += result['risk_score']
            count += 1
    
    if count == 0:
        return {'score': 0, 'level': 'LOW'}
    
    avg = total_risk // count
    
    if avg > 70:
        level = 'CRITICAL'
    elif avg > 50:
        level = 'HIGH'
    elif avg > 30:
        level = 'MEDIUM'
    else:
        level = 'LOW'
    
    return {'score': avg, 'level': level}