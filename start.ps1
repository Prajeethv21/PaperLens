# AI Research Paper Reviewer - Startup Script
# This script sets up and runs both frontend and backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Research Paper Reviewer Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Check if this is first time setup
$firstTimeSetup = $false
if (-not (Test-Path "$projectRoot\backend\venv")) {
    $firstTimeSetup = $true
    Write-Host "First time setup detected!" -ForegroundColor Yellow
    Write-Host ""
}

# Backend Setup
Write-Host "Setting up Backend..." -ForegroundColor Green
Set-Location "$projectRoot\backend"

if ($firstTimeSetup) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "$projectRoot\backend\venv\Scripts\Activate.ps1"
    
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Host "Creating .env file..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Please add your OpenAI API key to backend\.env" -ForegroundColor Red
        Write-Host ""
    }
    
    # Create necessary directories
    New-Item -ItemType Directory -Path "uploads" -Force | Out-Null
    New-Item -ItemType Directory -Path "reports" -Force | Out-Null
    New-Item -ItemType Directory -Path "vector_store\chroma_data" -Force | Out-Null
}

# Frontend Setup
Write-Host "Setting up Frontend..." -ForegroundColor Green
Set-Location "$projectRoot\frontend"

if ($firstTimeSetup) {
    Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask user if they want to start servers
$response = Read-Host "Do you want to start the servers now? (Y/N)"

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host ""
    Write-Host "Starting servers..." -ForegroundColor Green
    Write-Host ""
    
    # Start Backend in new terminal
    Write-Host "Starting Backend Server (http://localhost:8000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; .\venv\Scripts\Activate.ps1; python main.py"
    
    # Wait a bit for backend to start
    Start-Sleep -Seconds 3
    
    # Start Frontend in new terminal
    Write-Host "Starting Frontend Server (http://localhost:3000)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Servers are starting!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C in each terminal to stop the servers" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "To start the servers manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Backend:" -ForegroundColor Cyan
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  python main.py" -ForegroundColor White
    Write-Host ""
    Write-Host "Frontend:" -ForegroundColor Cyan
    Write-Host "  cd frontend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "Enjoy your AI Research Reviewer! 🧠✨" -ForegroundColor Magenta
