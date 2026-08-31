#!/usr/bin/env bash
set -e

echo "========================================================================="
echo " Bharat Electronics Limited - AI-Powered Mobile Urban Intelligence Platform"
echo " Starting UrbanEye System (Backend + Dashboard + Edge Simulation)"
echo "========================================================================="

export PYTHONPATH="$(pwd)"

# Start Backend
echo "Starting Backend Server on http://localhost:8000 ..."
(cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

sleep 2

# Start Dashboard
echo "Starting Frontend Dashboard on http://localhost:5173 ..."
(cd dashboard && npm run dev) &
DASHBOARD_PID=$!

sleep 2

# Start Edge Node
echo "Starting Edge Ingestion Daemon on BUS-101 ..."
python -m edge.main --bus-id BUS-101 --fps 10 &
EDGE_PID=$!

echo "All services running. Press Ctrl+C to terminate."
wait $BACKEND_PID $DASHBOARD_PID $EDGE_PID
