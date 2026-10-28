$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$env:ASPNETCORE_ENVIRONMENT = 'Development'
$env:LocalDevelopment__Enabled = 'true'
$env:ConnectionStrings__DefaultConnection = 'Host=127.0.0.1;Port=55432;Database=personalite_v2_local;Username=personalite_local;Pooling=false'
# Disposable key generated per run; no real credentials or user secrets are required.
$env:Jwt__SecretKey = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:Resend__ApiKey = ''
$env:Armazenamento__PastaFotos = Join-Path (Get-Location) '.local/fotos'
Write-Host 'Destino confirmado: 127.0.0.1:55432/personalite_v2_local; e-mail simulado.'
dotnet run --no-launch-profile --project src/PersonaLite.Api -- --urls http://localhost:5000
exit $LASTEXITCODE
