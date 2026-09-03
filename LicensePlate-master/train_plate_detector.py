#!/usr/bin/env python3
"""
Train YOLOv8 model on license plate detection dataset from Roboflow.
"""

import os
import zipfile
import shutil
from pathlib import Path

import torch
from ultralytics import YOLO


# Configuration
DATASET_ZIP = "dataset.zip"
DATASET_DIR = "data/roboflow_dataset"
MODELS_DIR = "models"
OUTPUT_MODEL = f"{MODELS_DIR}/license_plate_yolov8n.pt"

# Training parameters
MODEL_SIZE = "n"  # nano (n), small (s), medium (m), large (l), xlarge (x)
EPOCHS = 100
IMGSZ = 640
BATCH_SIZE = 8  # reduced for CPU
PATIENCE = 20  # early stopping patience


def get_device():
    """Auto-detect available device."""
    if torch.cuda.is_available():
        device = 0
        device_name = f"CUDA (GPU {torch.cuda.get_device_name(0)})"
    else:
        device = "cpu"
        device_name = "CPU"
    print(f"Using device: {device_name}")
    return device


def extract_dataset():
    """Extract Roboflow dataset from zip."""
    if os.path.exists(DATASET_DIR):
        print(f"Dataset already extracted at {DATASET_DIR}")
        return DATASET_DIR

    print(f"Extracting {DATASET_ZIP}...")
    with zipfile.ZipFile(DATASET_ZIP, "r") as zip_ref:
        zip_ref.extractall(DATASET_DIR)

    print(f"✓ Dataset extracted to {DATASET_DIR}")
    return DATASET_DIR


def create_data_yaml(dataset_path):
    """Create data.yaml for YOLO training."""
    yaml_path = os.path.join(dataset_path, "data.yaml")

    # Always recreate to ensure correct paths
    # Roboflow provides train, valid (or val), test splits
    train_path = os.path.join(dataset_path, "train")
    valid_path = os.path.join(dataset_path, "valid")
    val_path = os.path.join(dataset_path, "val")
    test_path = os.path.join(dataset_path, "test")

    # Check which splits exist
    has_train = os.path.exists(train_path)
    has_valid = os.path.exists(valid_path)
    has_val = os.path.exists(val_path)
    has_test = os.path.exists(test_path)

    print(f"Found splits - train: {has_train}, valid: {has_valid}, val: {has_val}, test: {has_test}")

    # Determine which validation folder to use
    val_folder = "valid" if has_valid else ("val" if has_val else "train")

    # Create YAML content with absolute paths
    yaml_content = f"""path: {os.path.abspath(dataset_path)}
train: train/images
val: {val_folder}/images

nc: 1
names:
  0: license_plate
"""

    with open(yaml_path, "w") as f:
        f.write(yaml_content)

    print(f"✓ Created {yaml_path}")
    print(f"  Using validation folder: {val_folder}")
    return yaml_path


def train_model(yaml_path, device):
    """Train YOLOv8 model."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    print(f"\n{'='*60}")
    print("Starting YOLOv8 License Plate Detection Training")
    print(f"{'='*60}")
    print(f"Model size: {MODEL_SIZE}")
    print(f"Epochs: {EPOCHS}")
    print(f"Image size: {IMGSZ}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Device: {device}")
    print(f"{'='*60}\n")

    # Initialize model
    model = YOLO(f"yolov8{MODEL_SIZE}.pt")

    # Train
    results = model.train(
        data=yaml_path,
        epochs=EPOCHS,
        imgsz=IMGSZ,
        batch=BATCH_SIZE,
        device=device,
        patience=PATIENCE,
        save=True,
        project=MODELS_DIR,
        name="license_plate_detector",
        verbose=True,
        augment=True,
        amp=True,
    )

    # Save the best model
    best_model_path = os.path.join(
        MODELS_DIR, "license_plate_detector", "weights", "best.pt"
    )
    if os.path.exists(best_model_path):
        shutil.copy(best_model_path, OUTPUT_MODEL)
        print(f"\n✓ Best model saved to {OUTPUT_MODEL}")

    return results


def validate_model(model_path):
    """Validate trained model."""
    print(f"\nValidating model at {model_path}...")
    model = YOLO(model_path)

    dataset_path = os.path.join(DATASET_DIR, "data.yaml")
    if os.path.exists(dataset_path):
        metrics = model.val(data=dataset_path)
        print(f"Validation metrics:")
        print(f"  mAP50: {metrics.box.map50:.4f}")
        print(f"  mAP50-95: {metrics.box.map:.4f}")


def main():
    print("License Plate Detector Training Pipeline\n")

    # Detect device
    device = get_device()
    print()

    # Extract dataset
    dataset_path = extract_dataset()
    print()

    # Create data.yaml
    yaml_path = create_data_yaml(dataset_path)
    print()

    # Train model
    results = train_model(yaml_path, device)

    # Validate
    if os.path.exists(OUTPUT_MODEL):
        validate_model(OUTPUT_MODEL)

    print(f"\n{'='*60}")
    print("Training Complete!")
    print(f"Model saved to: {OUTPUT_MODEL}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
