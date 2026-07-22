import pytest
from fastapi.testclient import TestClient
import numpy as np
import cv2
import io
from PIL import Image
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert "engines" in data

def test_predict_endpoint():
    # Create a synthetic 400x400 lunar image with a circle (simulated crater)
    img = np.ones((400, 400, 3), dtype=np.uint8) * 120
    cv2.circle(img, (200, 200), 50, (40, 40, 40), -1)

    pil_img = Image.fromarray(img)
    img_byte_arr = io.BytesIO()
    pil_img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    files = {"file": ("test_lunar.jpg", img_byte_arr, "image/jpeg")}
    response = client.post("/predict", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "overall_safety_score" in data
    assert "risk_level" in data
    assert "hazards" in data
    assert "safe_zones" in data
