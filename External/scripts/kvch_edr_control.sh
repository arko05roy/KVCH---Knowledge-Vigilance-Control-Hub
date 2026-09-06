#!/usr/bin/env bash
# KVCH 24/7 EDR Agent Control Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTERNAL_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$EXTERNAL_DIR/artifacts/kvch_edr_daemon.pid"
LOG_FILE="$EXTERNAL_DIR/artifacts/kvch_edr_daemon.log"

mkdir -p "$EXTERNAL_DIR/artifacts"

command_start() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "[KVCH EDR] Daemon is ALREADY running (PID: $PID)"
            exit 0
        fi
        rm -f "$PID_FILE"
    fi

    echo "[KVCH EDR] Starting 24/7 EDR Agent in background..."
    cd "$EXTERNAL_DIR"
    nohup python3 -m edr_daemon.agent > "$LOG_FILE" 2>&1 &
    NEW_PID=$!
    echo "$NEW_PID" > "$PID_FILE"
    sleep 1

    if kill -0 "$NEW_PID" 2>/dev/null; then
        echo "[KVCH EDR] Daemon started successfully! (PID: $NEW_PID)"
        echo "[KVCH EDR] Logs streaming to: $LOG_FILE"
    else
        echo "[KVCH EDR] Failed to start daemon. Check logs in $LOG_FILE"
        exit 1
    fi
}

command_stop() {
    if [ ! -f "$PID_FILE" ]; then
        echo "[KVCH EDR] Daemon is NOT running."
        exit 0
    fi

    PID=$(cat "$PID_FILE")
    echo "[KVCH EDR] Stopping 24/7 EDR Agent (PID: $PID)..."
    kill "$PID" 2>/dev/null || true
    sleep 1
    if kill -0 "$PID" 2>/dev/null; then
        kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
    echo "[KVCH EDR] Daemon stopped."
}

command_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "[KVCH EDR] Status: RUNNING (PID: $PID)"
            echo "[KVCH EDR] Log file: $LOG_FILE"
            exit 0
        fi
    fi
    echo "[KVCH EDR] Status: STOPPED"
}

command_logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -n 50 -f "$LOG_FILE"
    else
        echo "[KVCH EDR] No log file found at $LOG_FILE"
    fi
}

case "$1" in
    start)
        command_start
        ;;
    stop)
        command_stop
        ;;
    status)
        command_status
        ;;
    logs)
        command_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|status|logs}"
        exit 1
        ;;
esac
