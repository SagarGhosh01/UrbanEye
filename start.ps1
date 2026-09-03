# UrbanEye Platform PowerShell Start Script
$projectRoot = $PSScriptRoot

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host " Bharat Electronics Limited - AI Urban Intelligence Platform Launcher" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan

Write-Host "Launching Backend Server on http://localhost:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "Launching Dashboard Server on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot\dashboard'; npm run dev"

Write-Host "`nAll services launched successfully!" -ForegroundColor Yellow
Write-Host "Open Dashboard in Browser: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend Swagger Docs:       http://localhost:8000/docs" -ForegroundColor Cyan
