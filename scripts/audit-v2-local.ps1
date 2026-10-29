param(
    [ValidateSet('personalite_v2_local', 'personalite_v2_restorecheck')]
    [string]$Database = 'personalite_v2_restorecheck',
    [string]$PgBin = "$PSScriptRoot/../../postgresql/pgsql/bin"
)
$ErrorActionPreference = 'Stop'
$psql = (Resolve-Path (Join-Path $PgBin 'psql.exe')).Path
$sql = (Resolve-Path (Join-Path $PSScriptRoot 'audit-v2-readonly.sql')).Path
Write-Host "Auditoria somente leitura: 127.0.0.1:55432/$Database"
& $psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p 55432 -U personalite_local -d $Database -f $sql
if ($LASTEXITCODE -ne 0) { throw 'Auditoria SQL falhou.' }
