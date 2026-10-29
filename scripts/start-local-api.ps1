param([switch]$ApplyMigrations, [string]$CatalogFile, [Guid]$WithdrawVersion)
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
$argumentosLocais = @('--urls', 'http://localhost:5000')
if ($ApplyMigrations) { $argumentosLocais += '--apply-local-migrations' }
if ($CatalogFile) { $argumentosLocais += @('--import-local-catalog', (Resolve-Path -LiteralPath $CatalogFile).Path) }
if ($WithdrawVersion -and $WithdrawVersion -ne [Guid]::Empty) { $argumentosLocais += @('--withdraw-local-version', $WithdrawVersion.ToString()) }
dotnet run --no-build --no-launch-profile --project src/PersonaLite.Api -- @argumentosLocais
exit $LASTEXITCODE
