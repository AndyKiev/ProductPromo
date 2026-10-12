# Register the ProductPromo Postgres cluster (port 5435) as a Windows service.
#
# WHY: power cuts are frequent here. A cluster started with `pg_ctl start` from a VSCode
# task does not come back after a cut, and a normal Windows restart kills it uncleanly.
# A service is owned by the SCM: Windows starts it at boot and stops it cleanly at
# shutdown, and after a power cut Postgres repairs itself (crash recovery) with nobody
# at the keyboard. Same fix as the wms cluster (wms: scripts/register_postgres_service.ps1).
#
# The port is passed with -o: this cluster's postgresql.conf has NO port line, so
# without it the service would start on 5432 and clash with postgresql-x64-18.
#
# RUN THIS FROM AN ELEVATED POWERSHELL. It refuses to run otherwise.

$ErrorActionPreference = 'Stop'

$PgBin       = 'C:\Program Files\PostgreSQL\18\bin'
$DataDir     = 'D:\PostgresData\product_promo'   # the real folder; C:\Users\andre\PostgresData is only a junction to D:\PostgresData
$ServiceName = 'postgresql-productpromo'
$Port        = 5435
$Account     = 'NT AUTHORITY\NetworkService'   # mirrors postgresql-x64-18; no password needed

function Fail($msg) { Write-Host $msg -ForegroundColor Red; exit 1 }

# --- preconditions ---------------------------------------------------------

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
           ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Fail 'Not elevated. Re-run this script from an Administrator PowerShell.' }

if (-not (Test-Path $DataDir))          { Fail "Data directory not found: $DataDir" }
if (-not (Test-Path "$PgBin\pg_ctl.exe")) { Fail "pg_ctl not found in $PgBin" }

if (Get-Service $ServiceName -ErrorAction SilentlyContinue) {
    Write-Host "Service '$ServiceName' already exists. Nothing to do." -ForegroundColor Yellow
    Get-Service $ServiceName | Format-List Name, Status, StartType
    exit 0
}

# --- 1. stop the console-started server, or the service cannot bind the port ---

Write-Host "`n[1/4] Stopping any console-started server on $Port ..."
& "$PgBin\pg_ctl.exe" -D $DataDir status | Out-Null
if ($LASTEXITCODE -eq 0) {
    & "$PgBin\pg_ctl.exe" -D $DataDir -m fast -w -t 60 stop
    Write-Host '      stopped.'
} else {
    Write-Host '      nothing running.'
}

# --- 2. grant the service account access to the data directory ---------------

Write-Host "`n[2/4] Granting '$Account' access to the data directory ..."
$icacls = icacls $DataDir /grant "${Account}:(OI)(CI)F" /T /Q 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host $icacls; Fail 'icacls failed.' }
Write-Host '      granted.'

# --- 3. register -------------------------------------------------------------

Write-Host "`n[3/4] Registering service '$ServiceName' ..."
& "$PgBin\pg_ctl.exe" register -N $ServiceName -D $DataDir -U $Account -S auto -w -o "-p $Port"
if ($LASTEXITCODE -ne 0) { Fail 'pg_ctl register failed.' }
Write-Host '      registered (start type: Automatic).'

# --- 4. start and verify -----------------------------------------------------

Write-Host "`n[4/4] Starting and verifying ..."
Start-Service $ServiceName
for ($i = 0; $i -lt 60; $i++) {
    & "$PgBin\pg_isready.exe" -h 127.0.0.1 -p $Port -q
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
}
& "$PgBin\pg_isready.exe" -h 127.0.0.1 -p $Port
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nService registered but not accepting connections. Check:" -ForegroundColor Red
    Write-Host "  Get-WinEvent -FilterHashtable @{LogName='Application'; ProviderName='PostgreSQL'} -MaxEvents 20 | Format-List TimeCreated,Message"
    Write-Host "If it is a permissions problem, re-register as LocalSystem instead:"
    Write-Host "  & '$PgBin\pg_ctl.exe' unregister -N $ServiceName"
    Write-Host "  & '$PgBin\pg_ctl.exe' register -N $ServiceName -D '$DataDir' -S auto -w -o '-p $Port'"
    exit 1
}

Write-Host "`nDone. Postgres on $Port is now a service and starts at boot." -ForegroundColor Green
Get-Service $ServiceName | Format-List Name, Status, StartType
Write-Host "Stop it with:  Stop-Service $ServiceName"
Write-Host "scripts/dev/pg.sh (make db-*, Ctrl+Alt+5) now detects the service and uses it automatically."
