# License Plate Detector Training Guide

## Overview
Your Roboflow dataset has been extracted. The training script is ready to run on your local machine where you have internet access and GPU support.

## Dataset Structure
```
dataset/
├── train/
│   ├── images/
│   └── labels/
├── val/
│   ├── images/
│   └── labels/
└── test/
    ├── images/
    └── labels/
```

## Setup Instructions

### 1. Install Dependencies
If you haven't already, install the required packages:

```bash
pip install -r requirements.txt
```

Or for GPU training (NVIDIA CUDA):
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt
```

### 2. Run Training

**Option A: Using the provided training script**
```bash
python train_plate_detector.py
```

**Option B: Quick training with Ultralytics CLI**
```bash
yolo detect train data=data/roboflow_dataset/data.yaml model=yolov8n.pt epochs=100 imgsz=640 batch=16 device=0
```

### 3. Training Parameters

Edit `train_plate_detector.py` to adjust:
- `MODEL_SIZE`: "n" (nano) → "x" (xlarge) - larger = more accurate but slower
- `EPOCHS`: Number of training iterations (100 is reasonable)
- `BATCH_SIZE`: Larger batches need more GPU memory (16-32 typical)
- `PATIENCE`: Early stopping - stop if validation doesn't improve for N epochs
- `IMGSZ`: Input image size (640 is standard)

### 4. Monitor Training

The script will:
1. Extract the dataset
2. Create `data/roboflow_dataset/data.yaml` (YOLO format config)
3. Train YOLOv8 model
4. Save best model to `models/license_plate_yolov8n.pt`
5. Log training results to `training.log`

Training progress and metrics will be displayed in real-time.

### 5. Use Trained Model

Once training completes, update your `.env` to use the new model:

```bash
YOLO_WEIGHTS=models/license_plate_yolov8n.pt
HF_MODEL_REPO=  # leave empty to use local model
HF_MODEL_FILE=
```

Then restart the FastAPI server:
```bash
uvicorn app.main:app --reload
```

## Expected Results

- Training time: 30-60 minutes on modern GPU (varies by model size)
- Best model will be saved in `models/license_plate_detector/weights/best.pt`
- Validation metrics will show mAP (mean Average Precision)

## Troubleshooting

**CUDA out of memory:**
- Reduce `BATCH_SIZE` (try 8 or 4)
- Use smaller model size ("n" instead of "s")

**Dataset not found:**
- Make sure `dataset.zip` exists in the project root
- The script will extract it automatically

**Out of disk space:**
- Check available space: `df -h`
- Training creates temporary files during extraction
