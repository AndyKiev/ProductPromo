#!/usr/bin/env bash
# Start/stop the native Windows Postgres cluster (port 5435) from WSL.
#
# Two modes, chosen on every call:
# - service: the Windows service postgresql-catalog exists (made once by
#   scripts/register_postgres_service.ps1). Windows starts it at boot and stops
#   it cleanly at shutdown, so a power cut needs nobody at the keyboard. This
#   script then NEVER runs a console pg_ctl start/stop: a console postmaster
#   would hold the lock and the service could not start.
# - console: no service -- pg_ctl.exe start/stop from here.
#
# pg_ctl.exe is launched through PowerShell Start-Process: started directly via
# WSL interop, the server inherits the interop pipes and the calling shell
# never returns. Runs from /mnt/c because cmd.exe (used by pg_ctl) rejects the
# \\wsl.localhost working directory.
#
# The data dir is D:\PostgresData\product_promo. C:\Users\andre\PostgresData is a junction
# to D:\PostgresData -- same files, older paths may still use it.
set -u
PG_BIN_WIN='C:\Program Files\PostgreSQL\18\bin'
PG_DATA='D:\PostgresData\product_promo'
PG_LOG='D:\PostgresData\product_promo.log'
PG_LOG_WSL='/mnt/d/PostgresData/product_promo.log'
PG_BIN="/mnt/c/Program Files/PostgreSQL/18/bin"
SERVICE='postgresql-catalog'
cd /mnt/c || exit 1

ready() { "$PG_BIN/pg_isready.exe" -h 127.0.0.1 -p 5435 -q </dev/null >/dev/null 2>&1; }
has_service() { sc.exe query "$SERVICE" </dev/null >/dev/null 2>&1; }

wait_ready() {
  for i in $(seq 60); do
    ready && { echo "postgres ready on 5435"; return 0; }
    echo "waiting for postgres... ($i)"; sleep 1
  done
  return 1
}

case "${1:-}" in
  start)
    if ready; then echo "postgres already running on 5435"; exit 0; fi
    if has_service; then
      # Starting a service needs admin rights, so Windows shows a UAC prompt.
      echo "starting the Windows service $SERVICE -- confirm the Windows admin prompt"
      powershell.exe -NoProfile -Command "Start-Process sc.exe -ArgumentList 'start','$SERVICE' -Verb RunAs -WindowStyle Hidden" </dev/null
      wait_ready && exit 0
      echo "service $SERVICE did not come up. Its log is in Event Viewer:" >&2
      echo "  Windows Logs > Application, source PostgreSQL" >&2
      exit 1
    fi
    powershell.exe -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath '$PG_BIN_WIN\\pg_ctl.exe' -ArgumentList '-D \"$PG_DATA\" -l \"$PG_LOG\" -o \"-p 5435\" start'" </dev/null
    wait_ready && exit 0
    echo "postgres did not come up - last lines of $PG_LOG:" >&2
    tail -n 20 "$PG_LOG_WSL" >&2
    exit 1
    ;;
  stop)
    if has_service; then
      echo "postgres runs as the Windows service $SERVICE: Windows stops it cleanly"
      echo "at shutdown, so it stays running. To stop it now (Administrator PowerShell):"
      echo "  Stop-Service $SERVICE"
      exit 0
    fi
    "$PG_BIN/pg_ctl.exe" -D "$PG_DATA" -m fast -w -t 60 stop </dev/null
    ;;
  status)
    mode='console'; has_service && mode="service $SERVICE"
    if ready; then echo "postgres running on 5435 ($mode)"; else echo "postgres NOT running on 5435 ($mode)"; exit 1; fi
    ;;
  *)
    echo "usage: $0 start|stop|status" >&2; exit 2
    ;;
esac
