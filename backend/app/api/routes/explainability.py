from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import base64
from ...services.explainability import explainability_service

router = APIRouter()

class GradCamRequest(BaseModel):
    image_base64: str
    bbox: Optional[List[int]] = None

@router.post("/generate-gradcam")
async def generate_gradcam(req: GradCamRequest):
    """
    Generates Grad-CAM activation heatmap overlay on an image frame for explainability.
    """
    b64 = req.image_base64
    if "," in b64:
        b64 = b64.split(",")[1]
    
    try:
        raw_bytes = base64.b64decode(b64)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Base64 image")

    result = explainability_service.generate_gradcam_heatmap(raw_bytes, req.bbox)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
