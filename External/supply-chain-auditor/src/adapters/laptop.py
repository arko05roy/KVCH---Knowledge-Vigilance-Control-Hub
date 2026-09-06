"""Laptop system identification and profile discovery."""

import os
import sys
import socket
from pathlib import Path
from typing import List, Dict


def get_my_hostname() -> str:
    try:
        return socket.gethostname()
    except OSError:
        return "local-laptop"


def get_my_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def get_browser_extension_dirs() -> List[Dict[str, str]]:
    paths: List[Dict[str, str]] = []
    home = Path.home()

    if sys.platform == "win32":
        local_app_data = Path(os.environ.get("LOCALAPPDATA", home / "AppData" / "Local"))
        candidates = [
            ("Google Chrome", local_app_data / "Google" / "Chrome" / "User Data" / "Default" / "Extensions"),
            ("Microsoft Edge", local_app_data / "Microsoft" / "Edge" / "User Data" / "Default" / "Extensions"),
            ("Brave", local_app_data / "BraveSoftware" / "Brave-Browser" / "User Data" / "Default" / "Extensions"),
        ]
    elif sys.platform == "darwin":
        app_support = home / "Library" / "Application Support"
        candidates = [
            ("Google Chrome", app_support / "Google" / "Chrome" / "Default" / "Extensions"),
            ("Microsoft Edge", app_support / "Microsoft Edge" / "Default" / "Extensions"),
            ("Brave", app_support / "BraveSoftware" / "Brave-Browser" / "Default" / "Extensions"),
        ]
    else:
        config_dir = home / ".config"
        candidates = [
            ("Google Chrome", config_dir / "google-chrome" / "Default" / "Extensions"),
            ("Chromium", config_dir / "chromium" / "Default" / "Extensions"),
            ("Brave", config_dir / "BraveSoftware" / "Brave-Browser" / "Default" / "Extensions"),
        ]

    for browser_name, path in candidates:
        if path.exists() and path.is_dir():
            paths.append({"browser": browser_name, "path": str(path)})

    return paths
