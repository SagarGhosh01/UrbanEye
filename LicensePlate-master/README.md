# ALPR — Automatic License Plate Recognition System

Real-time, **two-stage** license plate detection, OCR, and per-vehicle tracking
served behind a FastAPI service. Built with YOLOv8 (Ultralytics), OpenCV,
EasyOCR, and SQLite for detection history.

## How it works

```
Frame
  └── Stage 1: vehicle detector (YOLOv8n COCO, filtered to car/truck/bus/motorcycle)
        └── For each detected vehicle, crop the frame:
              └── Stage 2: plate detector (YOLOv8 plate-finetuned on custom dataset)
                    └── For each plate, crop and run EasyOCR
        └── Update VehicleTracker (IoU on vehicle bboxes)
              └── Track accumulates plate readings across frames
                    └── Best plate = majority vote, tiebreak by OCR confidence
```

Why two-stage:

- **Far fewer false plates** — text on signs, billboards, and shop fronts gets
  filtered because plates can only be inside vehicle boxes.
- **Stable tracking** — vehicle bboxes are large and move smoothly between
  frames; plate bboxes are tiny and noisy. Tracking on vehicles is more reliable.
- **Plate–vehicle association** — every plate reading is naturally tied to a
  vehicle track ID, so "vehicle 17 was seen with plate ABC123 at 14:02" is just
  data you already have.

Default models:

- Stage 1: `yolov8n.pt` (auto-downloaded by Ultralytics, COCO pre-trained)
- Stage 2: `models/license_plate_yolov8n.pt` — YOLOv8n fine-tuned on custom license plate dataset

Both are swappable via env vars (see [Swapping the models](#swapping-the-models)).

## Quick start (local)

```bash
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/download_model.py    # fetches both YOLO models
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs to try the API.

## Quick start (Docker)

```bash
docker compose up --build
```

## Webcam demo

```bash
python scripts/webcam_demo.py            # default camera
python scripts/webcam_demo.py --source path/to/video.mp4
python scripts/webcam_demo.py --persist  # also write detections to SQLite
```

Press `q` to quit. Vehicle boxes render in orange, plate boxes in green.

## API

| Method | Path                  | Description                                                           |
|--------|-----------------------|-----------------------------------------------------------------------|
| POST   | `/detect/image`       | Upload an image, get a list of vehicles (each with detected plates)   |
| POST   | `/detect/video`       | Upload a short video, get aggregated **unique vehicles** + best plate |
| GET    | `/stream/mjpeg`       | Live MJPEG stream from the server's default camera                    |
| GET    | `/history`            | Query stored sightings (filter by plate text, vehicle class, date)    |
| GET    | `/health`             | Liveness check                                                        |

Example response from `/detect/image`:

```json
{
  "frame_index": 0,
  "width": 1280,
  "height": 720,
  "vehicles": [
    {
      "bbox": {"x1": 400, "y1": 220, "x2": 980, "y2": 660},
      "vehicle_class": "car",
      "detection_confidence": 0.91,
      "track_id": 1,
      "best_plate_text": "ABC1234",
      "best_plate_confidence": 0.87,
      "plates": [
        {
          "bbox": {"x1": 620, "y1": 540, "x2": 760, "y2": 580},
          "detection_confidence": 0.84,
          "plate_text": "ABC1234",
          "ocr_confidence": 0.87
        }
      ]
    }
  ]
}
```

## Project layout

```
alpr-system/
├── app/
│   ├── main.py            # FastAPI app entry
│   ├── config.py          # Settings (env-driven)
│   ├── schemas.py         # VehicleDetection, PlateDetection, etc.
│   ├── database.py        # SQLite + SQLAlchemy session
│   ├── models.py          # ORM model (Detection = one vehicle sighting)
│   ├── detector.py        # Generic YoloDetector, cached vehicle/plate instances
│   ├── ocr.py             # EasyOCR wrapper, cached instance
│   ├── tracker.py         # VehicleTracker with per-track plate history
│   ├── pipeline.py        # Two-stage orchestration + persistence + overlays
│   └── routes/
│       ├── detect.py      # /detect/image, /detect/video
│       ├── stream.py      # /stream/mjpeg
│       └── history.py     # /history
├── scripts/
│   ├── download_model.py  # fetches both YOLO models
│   └── webcam_demo.py
├── tests/
│   └── test_tracker.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

## Training a custom plate detector

To train a new plate detector on your own dataset:

```bash
python train_plate_detector.py
```

This will:
1. Extract the annotated dataset from `dataset.zip`
2. Train a YOLOv8 model on your custom data
3. Save the best model to `models/license_plate_yolov8n.pt`

See `TRAINING_SETUP.md` for detailed training configuration options.

## Swapping the models

Both detectors are configured via env vars:

```bash
# Stage 1 — vehicle
VEHICLE_WEIGHTS=models/yolov8n.pt        # any YOLOv8 trained on COCO
VEHICLE_CONF_THRESHOLD=0.40

# Stage 2 — plate (custom trained)
YOLO_WEIGHTS=models/license_plate_yolov8n.pt
DETECTION_CONF_THRESHOLD=0.35
```

Simply update `YOLO_WEIGHTS` to point to your custom trained model, or drop a 
new `.pt` file at the configured path.

If you want a heavier stage-1 model for better small-vehicle recall, point
`VEHICLE_WEIGHTS` at `yolov8s.pt` or `yolov8m.pt` (Ultralytics will download
those names automatically).

## Roadmap

- [x] Plate-finetuned stage-2 detector
- [x] Two-stage vehicle → plate pipeline
- [ ] Swap IoU tracker for ByteTrack / DeepSORT
- [ ] Replace EasyOCR with PaddleOCR or FastPlateOCR for tougher plates
- [ ] React dashboard for live monitoring
- [ ] Postgres + Alembic migrations
- [ ] Prometheus metrics + Grafana dashboard

## Note on the DB schema

The `detections` table changed shape going from one-stage to two-stage (one row
per vehicle sighting, with optional plate columns). If you've already created
`data/alpr.db` under the old schema, delete it before starting the server again
— SQLAlchemy will recreate it on first run.
