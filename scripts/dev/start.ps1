$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$secretsDirectory = Join-Path $projectRoot 'deploy\secrets'
$composeFile = Join-Path $projectRoot 'deploy\compose.yaml'

New-Item -ItemType Directory -Force -Path $secretsDirectory | Out-Null

$secretNames = @(
    'mysql_root_password',
    'mysql_migrator_password',
    'mysql_runtime_password',
    'mysql_backup_password',
    'mysql_retention_password',
    'auth_throttle_hmac_key',
    'demo_admin_password'
)

foreach ($secretName in $secretNames) {
    $secretPath = Join-Path $secretsDirectory $secretName
    if (-not (Test-Path -LiteralPath $secretPath)) {
        $bytes = [byte[]]::new(48)
        $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
        $value = ([BitConverter]::ToString($bytes) -replace '-', '').ToLowerInvariant()
        [System.IO.File]::WriteAllText($secretPath, $value, [System.Text.UTF8Encoding]::new($false))
    }
}

docker compose -f $composeFile up --build -d
if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar os containers.' }

Write-Host ''
Write-Host 'Sistema iniciado em http://localhost:8088'
Write-Host 'Usuário de demonstração: admin'
Write-Host "Senha de demonstração: $(Get-Content -LiteralPath (Join-Path $secretsDirectory 'demo_admin_password') -Raw)"
Write-Host 'Para acompanhar: docker compose -f deploy/compose.yaml logs -f'
