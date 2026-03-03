# ============================================
# AI Research Reviewer - Quick Start
# ============================================
# This script sets up and runs your application

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Research Paper Reviewer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Step 1: Check Python
Write-Host "[1/4] Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "      ✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Step 2: Setup Virtual Environment
Write-Host ""
Write-Host "[2/4] Setting up Backend..." -ForegroundColor Yellow
Set-Location "$projectRoot\backend"

if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "      Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
    Write-Host "      ✓ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "      ✓ Virtual environment exists" -ForegroundColor Green
}

# Step 3: Install Dependencies
Write-Host ""
Write-Host "[3/4] Installing Python packages..." -ForegroundColor Yellow
& ".\venv\Scripts\python.exe" -m pip install --quiet --upgrade pip
& ".\venv\Scripts\pip.exe" install --quiet -r requirements.txt
Write-Host "      ✓ Python packages installed" -ForegroundColor Green

# Step 4: Check API Key
Write-Host ""
Write-Host "[4/4] Checking configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "OPENAI_API_KEY=gsk_") {
        Write-Host "      ✓ Grok API key configured" -ForegroundColor Green
    } else {
        Write-Host "      ⚠ API key might not be set correctly" -ForegroundColor Yellow
    }
} else {
    Write-Host "      ⚠ .env file not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Start servers
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$projectRoot\backend'; .\venv\Scripts\Activate.ps1; Write-Host 'Backend Server Starting...' -ForegroundColor Green; python main.py"
)

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
Set-Location "$projectRoot\frontend"
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js packages (first time only)..." -ForegroundColor Yellow
    npm install
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$projectRoot\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers are starting in new windows!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend API:  " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:     " -NoNewline; Write-Host "http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Frontend App: " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C in each server window to stop them" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy analyzing! 🎉" -ForegroundColor Magenta
Write-Host ""
