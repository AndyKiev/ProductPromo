#!/usr/bin/env bash
# Start/stop the native Windows Postgres cluster (port 5435) from WSL.
#
# pg_ctl.exe is launched through PowerShell Start-Process: started directly via
# WSL interop, the server inherits the interop pipes and the calling shell
# never returns. Runs from /mnt/c because cmd.exe (used by pg_ctl) rejects the
# \\wsl.localhost working directory.
set -u
PG_BIN_WIN='C:\Program Files\PostgreSQL\18\bin'
PG_DATA='C:\Users\andre\PostgresData\product_promo'
PG_LOG='C:\Users\andre\PostgresData\product_promo.log'
PG_BIN="/mnt/c/Program Files/PostgreSQL/18/bin"
cd /mnt/c || exit 1

ready() { "$PG_BIN/pg_isready.exe" -h 127.0.0.1 -p 5435 -q </dev/null >/dev/null 2>&1; }

case "${1:-}" in
  start)
    if ready; then echo "postgres already running on 5435"; exit 0; fi
    powershell.exe -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath '$PG_BIN_WIN\\pg_ctl.exe' -ArgumentList '-D \"$PG_DATA\" -l \"$PG_LOG\" -o \"-p 5435\" start'" </dev/null
    for i in $(seq 60); do ready && { echo "postgres ready on 5435"; exit 0; }; echo "waiting for postgres... ($i)"; sleep 1; done
    echo "postgres did not come up - see $PG_LOG" >&2; exit 1
    ;;
  stop)
    "$PG_BIN/pg_ctl.exe" -D "$PG_DATA" -m fast -w -t 60 stop </dev/null
    ;;
  *)
    echo "usage: $0 start|stop" >&2; exit 2
    ;;
esac
