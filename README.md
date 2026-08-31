# BEL UrbanEye: AI-Powered Mobile Urban Intelligence Platform
### Production Engineering Platform for Bharat Electronics Limited (BEL)

> **"Turning Public Transport Bus Fleets into a Roaming City-Wide AI Sensing Network"**

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TIER 1 — EDGE (Per Bus)                         │
│  - Multi-source Video Capture (Webcam / MP4 / RTSP / Synthetic Stream) │
│  - Edge AI Inference:                                                  │
│      • YOLO-based Vehicle & Pedestrian Detection                       │
│      • ByteTrack/IoU Multi-Object Tracking (Anti-double counting)      │
│      • Road Damage & Hazard Segmentation (Potholes, Waterlogging)      │
│      • Gated ANPR / Plate OCR (Confidence thresholded)                 │
│      • Anomaly & Incident Rule Engine (Near-miss, rash driving)        │
│  - GPS Geotagging & Telemetry Fusion                                   │
│  - Local SQLite Store-and-Forward Buffer (Offline Resilience)          │
│  - Edge Bandwidth Tracker (Real vs. Raw Video Savings Measurement)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ MQTT / WebSocket / HTTPS Uplink
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               TIER 2 & 3 — CLOUD / COMMAND PLATFORM BACKEND            │
│  - FastAPI Microservices Architecture:                                 │
│      • Ingestion Service (MQTT / REST Ingestion + Schema Validation)   │
│      • Event Service (PostgreSQL / SQLite + Spatial Queries)           │
│      • Realtime Broadcast Service (WebSockets for telemetry & events)  │
│      • Analytics Service (Hotspots, Segment Scoring, OD patterns)      │
│      • Fleet & Device Management Service (Heartbeats, Device Shadow)   │
│      • Auth & RBAC Service (JWT: Viewer, Analyst, Admin, Law Liaison)  │
│      • Notification Service (High severity dispatch & alerts)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Live WebSocket + REST APIs
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           TIER 3 — URBAN COMMAND & CONTROL CENTER (React + TS)         │
│  - Fleet Live KPI Overview (Active buses, Potholes, Vehicles, Savings) │
│  - Live Edge AI Vision Panel with Bounding Box Overlays & HUD Gauges   │
│  - Fullscreen GIS Map (Leaflet) with Bus Telemetry & Incident Layers   │
│  - Spatial Density Heatmaps (Traffic congestion & Road Hazards)        │
│  - Live Event Timeline & Inspection Drawer with Evidence Dossier       │
│  - Municipal Road Health & Maintenance Priority Scoring (0-100)        │
│  - Restricted ANPR & Safety Incident Review Console (Human-in-the-Loop)│
│  - Edge Hardware Diagnostics (CPU/GPU Temp, Ping, Offline Reconnect)   │
│  - Interactive Pilot Demo Mode & Multi-Bus Simulator Controller        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Technical Innovations

1. **Zero-Fabrication AI & Sensor Policy**:
   - The platform strictly enforces honesty in AI detection. If a license plate is occluded or confidence is $<0.75$, the plate is explicitly labeled `"Not readable"`.
   - If GPS is lost in an underpass or tunnel, coordinates report `status: "UNAVAILABLE"` rather than hallucinating location.
2. **Store-and-Forward Offline Resilience**:
   - When cellular uplink drops, the edge node automatically buffers structured events into local SQLite storage and flushes in batches upon reconnection without data loss.
3. **97.4%+ Bandwidth Conservation**:
   - Rather than streaming raw 1080p video ($~160\text{ GB/day}$ across 5 buses), only structured JSON events and thumbnails ($~1.24\text{ GB/day}$) leave the bus.
4. **Anti-Double-Counting Vehicle Tracker**:
   - ByteTrack/IoU tracking assigns persistent Track IDs across frames to compute accurate cumulative vehicle volume.
5. **Role-Based Access Control (RBAC)**:
   - Law enforcement ANPR logs and incident evidence are restricted to `law_enforcement_liaison` and `admin` roles.

---

## 3. Quickstart & Local Development

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.12)
- **Node.js**: 18+ (tested on Node v24)
- **npm**: 10+

### Option A: One-Click Startup (Windows)
```cmd
scripts\start_dev.bat
```

### Option B: Manual Multi-Service Startup

#### 1. Backend Service
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- **API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **WebSocket Endpoint**: `ws://localhost:8000/ws`

#### 2. Frontend Command & Control Dashboard
```bash
cd dashboard
npm install
npm run dev
```
- **Dashboard URL**: `http://localhost:5173`

#### 3. Edge AI Node Simulator
```bash
# In the workspace root:
python -m edge.main --bus-id BUS-101 --fps 10
```

---

## 4. Docker Deployment

To launch the complete three-tier containerized stack with one command:
```bash
docker-compose up --build
```

---

## 5. Automated Test Suite

Run the full pytest integration test suite covering backend REST endpoints, WebSocket event broadcast, RBAC security, and edge store-and-forward resilience:
```bash
pytest tests/ -v
```

---

## 6. Default User Accounts (RBAC)

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Chief Admin** | `admin` | `admin123` | Full system access & config |
| **City Analyst** | `analyst` | `analyst123` | KPIs, Road Condition, Heatmaps |
| **Police Liaison** | `traffic_police` | `police123` | ANPR Console & Incident Dossiers |
| **General Viewer** | `viewer` | `viewer123` | Read-only public transit dashboard |
