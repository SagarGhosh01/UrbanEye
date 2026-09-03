#!/usr/bin/env python3
"""
Test the newly trained license plate detector model on images and video.
"""

import os
import cv2
from pathlib import Path
from ultralytics import YOLO

# Model path
MODEL_PATH = "models/license_plate_yolov8n.pt"
TEST_IMAGE = "test_plate.jpg"

def test_on_image(model, image_path):
    """Test model on a single image."""
    print(f"\n{'='*60}")
    print(f"Testing on image: {image_path}")
    print(f"{'='*60}")

    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return

    # Run inference
    results = model.predict(source=image_path, conf=0.35, save=True, project="inference_results")

    # Print results
    for result in results:
        if len(result.boxes) > 0:
            print(f"\n✓ Detected {len(result.boxes)} license plate(s)")
            for i, box in enumerate(result.boxes):
                conf = box.conf.item()
                print(f"  Plate {i+1}: Confidence={conf:.2%}, Box={box.xyxy.tolist()}")
        else:
            print("\n✗ No plates detected")

def test_on_validation_set(model):
    """Test model on validation dataset."""
    print(f"\n{'='*60}")
    print("Testing on Validation Set")
    print(f"{'='*60}")

    val_dir = "data/roboflow_dataset/valid/images"
    if not os.path.exists(val_dir):
        print(f"Validation directory not found: {val_dir}")
        return

    # Get all images
    images = list(Path(val_dir).glob("*.jpg")) + list(Path(val_dir).glob("*.jpeg")) + list(Path(val_dir).glob("*.png"))
    print(f"Found {len(images)} validation images")

    # Test on first 5 images
    total_detections = 0
    for i, img_path in enumerate(images[:5]):
        results = model.predict(source=str(img_path), conf=0.35, verbose=False)
        for result in results:
            total_detections += len(result.boxes)
        print(f"  {i+1}. {img_path.name}: {len(results[0].boxes)} detections")

    print(f"\nTotal detections in sample: {total_detections}")

def main():
    print("License Plate Detector — Model Testing")
    print(f"Model: {MODEL_PATH}\n")

    # Check if model exists
    if not os.path.exists(MODEL_PATH):
        print(f"✗ Model not found at {MODEL_PATH}")
        print("Make sure training completed successfully.")
        return

    print("✓ Model loaded")

    # Load model
    model = YOLO(MODEL_PATH)

    # Test on sample image
    if os.path.exists(TEST_IMAGE):
        test_on_image(model, TEST_IMAGE)

    # Test on validation set
    test_on_validation_set(model)

    print(f"\n{'='*60}")
    print("Testing Complete!")
    print(f"Results saved to: inference_results/")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
