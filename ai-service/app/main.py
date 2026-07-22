from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import io
from PIL import Image
import os
import time

from app.hazard_detector import LunarHazardDetector
from app.safety_evaluator import LandingSafetyEvaluator
from app.visualizer import LunarVisualizer

app = FastAPI(
    title="AI-Based Lunar Landing Assistant - AI Service",
    description="Python microservice providing YOLOv8 object hazard detection and TensorFlow landing safety scoring",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Engines
detector = LunarHazardDetector(confidence_threshold=0.25)
evaluator = LandingSafetyEvaluator()
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "annotated_outputs")

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "AI-Based Lunar Landing Assistant - Python AI Service",
        "engines": {
            "yolov8": "Active",
            "opencv_pipeline": "Active",
            "tf_safety_evaluator": "Active"
        },
        "timestamp": time.time()
    }

@app.post("/predict")
async def predict_lunar_landing(file: UploadFile = File(...)):
    start_time = time.time()
    try:
        # Validate File Mimetype
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File uploaded must be a valid image")

        contents = await file.read()
        image_pil = Image.open(io.BytesIO(contents)).convert('RGB')
        image_np = np.array(image_pil)
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # 1. Detect Hazards (Craters, Boulders, Slopes)
        hazards, hazard_detection_time = detector.detect_hazards(image_bgr)

        # 2. Evaluate Landing Safety & Safe Landing Zone Coordinates
        overall_score, risk_level, safe_zones = evaluator.evaluate_landing_safety(image_bgr, hazards)

        # 3. Generate Annotated Overlay Image
        annotated_bgr = LunarVisualizer.draw_annotations(
            image_bgr, hazards, safe_zones, overall_score, risk_level
        )

        output_filename = f"annotated_{file.filename}"
        LunarVisualizer.save_annotated_image(annotated_bgr, OUTPUT_DIR, output_filename)

        total_execution_time_ms = int((time.time() - start_time) * 1000)

        return {
            "success": True,
            "filename": file.filename,
            "overall_safety_score": overall_score,
            "risk_level": risk_level,
            "hazards": hazards,
            "safe_zones": safe_zones,
            "annotated_image_filename": output_filename,
            "execution_time_ms": total_execution_time_ms
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Inference Error: {str(e)}")
