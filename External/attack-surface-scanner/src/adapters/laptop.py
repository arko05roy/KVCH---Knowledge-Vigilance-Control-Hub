"""Laptop network and identity auto-detection adapter."""

import ipaddress
import socket
import subprocess


def get_my_ip() -> str:
    """Return local IPv4 address dynamically using ifconfig or fallback methods."""
    try:
        result = subprocess.run(['ifconfig'], capture_output=True, text=True, check=False)
        for line in result.stdout.splitlines():
            fields = line.split()
            if 'inet' in fields:
                candidate = fields[fields.index('inet') + 1]
                try:
                    address = ipaddress.ip_address(candidate)
                    if address.version == 4 and not address.is_loopback:
                        return candidate
                except ValueError:
                    continue
    except (OSError, subprocess.SubprocessError):
        pass

    try:
        interface = get_my_interface()
        result = subprocess.run(
            ['ipconfig', 'getifaddr', interface],
            capture_output=True,
            text=True,
            check=False,
        )
        candidate = result.stdout.strip()
        address = ipaddress.ip_address(candidate)
        if address.version == 4 and not address.is_loopback:
            return candidate
    except (OSError, ValueError, subprocess.SubprocessError):
        pass

    return '127.0.0.1'


def get_my_hostname() -> str:
    """Return local system hostname."""
    try:
        return socket.gethostname()
    except OSError:
        return 'local-laptop'


def get_my_interface() -> str:
    """Return interface used by default route."""
    try:
        result = subprocess.run(['route', 'get', 'default'], capture_output=True, text=True, check=False)
        for line in result.stdout.splitlines():
            if 'interface:' in line:
                return line.split(':', 1)[1].strip()
    except (OSError, subprocess.SubprocessError):
        pass
    return 'en0'
