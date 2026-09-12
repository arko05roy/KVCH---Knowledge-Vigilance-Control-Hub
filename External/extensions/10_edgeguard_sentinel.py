#!/usr/bin/env python3
"""
EXTENSION 10: EdgeGuard-Sentinel (CDN, WAF & Origin IP Firewall Shield)
Tool 10: Edge Proxy Header Audit, Origin IP Leak Detector, Micro-Fuzzing Engine & WAF Auto-Patcher
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "edgeguard-sentinel"))

from src.main import main

if __name__ == "__main__":
    main()
