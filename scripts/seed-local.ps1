$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$file = '.local/demo.json'
if (!(Test-Path $file)) {
    New-Item -ItemType Directory -Force .local | Out-Null
    @{
        nome = 'Pessoa Ficticia'; nomeUsuario = 'demo_local'
        senha = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(18))
        sexo = 'Masculino'; dataNascimento = '1995-01-01'; alturaCm = 175
        email = 'demo@example.invalid'
    } | ConvertTo-Json | Set-Content $file
    $null = Invoke-RestMethod http://localhost:5000/api/auth/registrar -Method Post -ContentType application/json -Body (Get-Content $file -Raw)
}
$account = Get-Content $file -Raw | ConvertFrom-Json
$login = @{nomeUsuario=$account.nomeUsuario; senha=$account.senha} | ConvertTo-Json
$auth = Invoke-RestMethod http://localhost:5000/api/auth/login -Method Post -ContentType application/json -Body $login
$headers = @{Authorization="Bearer $($auth.token)"}
$null = Invoke-RestMethod http://localhost:5000/api/usuario -Headers $headers
$null = Invoke-RestMethod http://localhost:5000/api/usuario/email/solicitar-verificacao -Method Post -Headers $headers
Write-Host 'Login e consulta autenticada OK. Verificação de e-mail solicitada ao simulador.'
Write-Host 'Credenciais fictícias em .local/demo.json (ignorado pelo Git).'
