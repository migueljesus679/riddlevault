# Gandalf - Setup Inicial (Windows)
# Uso: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n=== Gandalf - Setup ===" -ForegroundColor Yellow

# Verificar Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker nao encontrado. Instala Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Docker encontrado" -ForegroundColor Green

# Copiar .env se nao existe
if (-not (Test-Path ".env")) {
    Copy-Item "env.example" ".env"
    Write-Host "[OK] Ficheiro .env criado a partir de env.example" -ForegroundColor Green
    Write-Host "     Edita o .env com as tuas chaves API antes de continuar." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Ficheiro .env ja existe" -ForegroundColor Green
}

# Iniciar servicos
Write-Host "`nA iniciar servicos Docker..." -ForegroundColor Cyan
docker compose up --build -d

Write-Host "`n=== Gandalf esta a correr! ===" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:5173"
Write-Host "Node API:    http://localhost:3001/health"
Write-Host "Python API:  http://localhost:8000/health"
Write-Host ""
