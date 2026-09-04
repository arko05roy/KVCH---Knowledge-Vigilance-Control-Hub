#!/usr/bin/env python3
"""Terminal colors for epic output"""

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    MAGENTA = '\033[35m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    BLINK = '\033[5m'
    DIM = '\033[2m'
    RESET = '\033[0m'
    WHITE = '\033[97m'
    
    # Background colors
    BG_RED = '\033[41m'
    BG_GREEN = '\033[42m'
    BG_YELLOW = '\033[43m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'

def print_banner(text, color=Colors.CYAN):
    print(f"\n{color}{'='*70}{Colors.RESET}")
    print(f"{color} {text.center(68)} {Colors.RESET}")
    print(f"{color}{'='*70}{Colors.RESET}\n")

def print_alert(text, severity="INFO"):
    icons = {
        "INFO": "ℹ",
        "WARNING": "⚠",
        "ERROR": "✖",
        "SUCCESS": "✔",
        "CRITICAL": "🔥"
    }
    colors = {
        "INFO": Colors.BLUE,
        "WARNING": Colors.YELLOW,
        "ERROR": Colors.RED,
        "SUCCESS": Colors.GREEN,
        "CRITICAL": Colors.BG_RED + Colors.WHITE
    }
    print(f"{colors.get(severity, Colors.WHITE)} {icons.get(severity, '•')} {text} {Colors.RESET}")