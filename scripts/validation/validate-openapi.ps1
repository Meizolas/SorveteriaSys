$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Push-Location (Join-Path $root 'frontend')
try {
    npm run validate:openapi
    npm run typecheck
} finally {
    Pop-Location
}
