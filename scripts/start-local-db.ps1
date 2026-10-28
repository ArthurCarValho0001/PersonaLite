param([string]$PgBin = "$PSScriptRoot/../.local-tools/postgresql/pgsql/bin")
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$data = Join-Path (Get-Location) '.local/pgdata'
New-Item -ItemType Directory -Force .local | Out-Null
if (!(Test-Path "$data/PG_VERSION")) {
    & "$PgBin/initdb.exe" -D $data -U personalite_local --auth=trust --encoding=UTF8 --locale=C
    if ($LASTEXITCODE) { throw 'initdb falhou' }
}
# Trust is restricted to loopback in this disposable cluster; never bind to a LAN interface.
& "$PgBin/pg_ctl.exe" -D $data -l .local/postgres.log -o '-h 127.0.0.1 -p 55432' -w start
if ($LASTEXITCODE) { throw 'pg_ctl falhou (verifique se o cluster já está iniciado)' }
$exists = & "$PgBin/psql.exe" -h 127.0.0.1 -p 55432 -U personalite_local -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='personalite_v2_local'"
if ($exists -ne '1') {
    & "$PgBin/createdb.exe" -h 127.0.0.1 -p 55432 -U personalite_local personalite_v2_local
    if ($LASTEXITCODE) { throw 'createdb falhou' }
}
& "$PgBin/psql.exe" -h 127.0.0.1 -p 55432 -U personalite_local -d personalite_v2_local -c 'SELECT current_database(), current_user, inet_server_addr(), inet_server_port(), version();'
