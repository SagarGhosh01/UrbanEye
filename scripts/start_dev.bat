@echo off
echo =========================================================================
echo  Bharat Electronics Limited - AI-Powered Mobile Urban Intelligence Platform
echo  Starting UrbanEye System (Backend + Dashboard + Edge Simulation)
echo =========================================================================

set PYTHONPATH=%CD%

echo Starting Backend Server on http://localhost:8000 ...
start "UrbanEye Backend" cmd /k "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo Starting Frontend Dashboard on http://localhost:5173 ...
start "UrbanEye Dashboard" cmd /k "cd dashboard && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting Edge Ingestion Daemon on BUS-101 ...
start "UrbanEye Edge Bus-101" cmd /k "python -m edge.main --bus-id BUS-101 --fps 10"

echo.
echo All services launched!
echo Open Dashboard: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo =========================================================================
