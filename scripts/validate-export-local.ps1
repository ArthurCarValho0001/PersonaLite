$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead((Join-Path (Get-Location) '.local/v2-export.zip'))
try {
  $conteudos = @{}
  foreach ($entry in $zip.Entries) { $reader=[IO.StreamReader]::new($entry.Open()); try {$conteudos[$entry.FullName]=$reader.ReadToEnd()} finally {$reader.Dispose()} }
  foreach ($tipo in @('perfil','medidas','planos','dias','exercicios','sessoes','series','ciclos','aulas_estudadas','tentativas')) { if (-not $conteudos.ContainsKey("$tipo.csv")) {throw "CSV ausente: $tipo"} }
  $perfil=@($conteudos['perfil.csv'] | ConvertFrom-Csv)
  if ($perfil.Count -ne 1 -or $perfil[0].Nome -ne "'=1+1") {throw 'Proteção contra fórmula ou cardinalidade do perfil inválida.'}
  if ($conteudos['perfil.csv'] -match 'SenhaHash|Token|AvatarUrl|Codigo') {throw 'Campo restrito exportado.'}
  $medidas=@($conteudos['medidas.csv'] | ConvertFrom-Csv)
  if ($medidas.Count -ne 1) {throw 'Cardinalidade de medidas inválida.'}
  $colunas=@($medidas[0].PSObject.Properties.Name)
  if (@($colunas | Where-Object {$_ -match 'Cm$'}).Count -ne 14 -or @($colunas | Where-Object {$_ -match 'Mm$'}).Count -ne 7) {throw 'Campos de medidas incompletos.'}
  if ($conteudos['LEIA-ME.txt'] -notmatch 'Pendências' -or $conteudos['LEIA-ME.txt'] -notmatch 'Referência UTC') {throw 'Metadados ausentes.'}
  $resultado=@{csvsPorTipo=$true; formulaProtegida=$true; semCredenciaisOuAvatar=$true; circunferencias=14; dobras=7; somenteContaDaFixture=$true}
  $resultado | ConvertTo-Json | Set-Content .local/export-results.json
  $resultado | ConvertTo-Json
} finally {$zip.Dispose()}
