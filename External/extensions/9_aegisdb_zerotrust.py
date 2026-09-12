#!/usr/bin/env python3
"""
EXTENSION 9: AegisDB-ZeroTrust (Database AST & Secret Exfiltration Shield)
Tool 9: Database Socket Driver Gate, AST Normalization, Vector Defense & Active Neutralization
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "aegisdb-zerotrust"))

from src.main import main

if __name__ == "__main__":
    main()
