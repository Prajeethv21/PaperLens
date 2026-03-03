Write-Host ""
Write-Host "Starting AI Research Reviewer..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing Python or Node processes on our ports
Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*research-reviewer*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*research-reviewer*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Backend
Write-Host "[1/2] Starting Backend (Port 8000)..." -ForegroundColor Yellow
$backendCmd = "Set-Location 'c:\Users\praje\Documents\research-reviewer\backend'; .\venv\Scripts\Activate.ps1; python -m uvicorn main:app --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Start-Sleep -Seconds 5

# Frontend  
Write-Host "[2/2] Starting Frontend (Port 3001)..." -ForegroundColor Yellow
$frontendCmd = "Set-Location 'c:\Users\praje\Documents\research-reviewer\frontend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Done! Opening browser..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:3001"
