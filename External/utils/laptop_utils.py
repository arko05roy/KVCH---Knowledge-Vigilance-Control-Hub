"""Helpers for safely targeting the local laptop."""

import ipaddress
import os
import socket
import subprocess


def get_my_ip():
    """Return the first non-loopback local IPv4 address."""
    try:
        result = subprocess.run(['ifconfig'], capture_output=True, text=True, check=False)
        for line in result.stdout.splitlines():
            fields = line.split()
            if 'inet' in fields:
                candidate = fields[fields.index('inet') + 1]
                address = ipaddress.ip_address(candidate)
                if address.version == 4 and not address.is_loopback:
                    return candidate
    except (OSError, ValueError, IndexError):
        pass

    try:
        result = subprocess.run(
            ['ipconfig', 'getifaddr', get_my_interface()],
            capture_output=True,
            text=True,
            check=False,
        )
        candidate = result.stdout.strip()
        address = ipaddress.ip_address(candidate)
        if address.version == 4 and not address.is_loopback:
            return candidate
    except (OSError, ValueError):
        pass

    return '127.0.0.1'


def get_my_hostname():
    """Return the system hostname."""
    try:
        return socket.gethostname()
    except OSError:
        return 'local-laptop'


def get_my_interface():
    """Return the interface used by the default route."""
    try:
        result = subprocess.run(['route', 'get', 'default'], capture_output=True, text=True, check=False)
        for line in result.stdout.splitlines():
            if 'interface:' in line:
                return line.split(':', 1)[1].strip()
    except OSError:
        pass
    return 'en0'


def print_laptop_info():
    """Print the local target identity used by an extension."""
    print('=' * 60)
    print('KVCH - ANALYZING LOCAL LAPTOP')
    print('=' * 60)
    print(f'IP Address: {get_my_ip()}')
    print(f'Hostname: {get_my_hostname()}')
    print(f'Interface: {get_my_interface()}')
    print('=' * 60)


def get_netstat_snapshot(max_lines=200):
    """Return a bounded snapshot of the laptop's current network sockets."""
    try:
        result = subprocess.run(
            ['netstat', '-anv'], capture_output=True, text=True, timeout=10, check=False
        )
        lines = result.stdout.splitlines()
        return {
            'available': True,
            'return_code': result.returncode,
            'lines': lines[:max_lines],
            'truncated': len(lines) > max_lines,
        }
    except (OSError, subprocess.SubprocessError) as error:
        return {'available': False, 'error': str(error), 'lines': []}
