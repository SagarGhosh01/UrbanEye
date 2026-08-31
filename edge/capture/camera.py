import time
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import base64
from typing import Optional, Tuple, Dict, Any

class VideoCaptureSource:
    def __init__(self, source_type: str = "synthetic", source_path: Optional[str] = None):
        self.source_type = source_type
        self.source_path = source_path
        self.frame_count = 0
        self.width = 1280
        self.height = 720
        self.is_open = True
        
    def read(self) -> Tuple[bool, Optional[np.ndarray], Optional[str]]:
        """
        Reads the next video frame.
        Returns: (success, frame_array, base64_encoded_jpeg)
        """
        if not self.is_open:
            return False, None, None
            
        self.frame_count += 1
        
        # Generate high-clarity synthetic bus camera frame simulating front windshield view
        img = Image.new('RGB', (self.width, self.height), color=(30, 41, 59))
        draw = ImageDraw.Draw(img)
        
        # Road perspective
        draw.polygon([(200, 720), (540, 360), (740, 360), (1080, 720)], fill=(51, 65, 85))
        # Center lane dashed markings
        dash_offset = (self.frame_count * 15) % 120
        for y in range(380, 700, 60):
            adjusted_y = y + dash_offset
            if adjusted_y < 710:
                draw.line([(640, adjusted_y), (640, adjusted_y + 30)], fill=(251, 191, 36), width=4)
                
        # Sky and skyline
        draw.rectangle([(0, 0), (1280, 360)], fill=(15, 23, 42))
        
        # Overlay camera telemetry HUD
        hud_text = f"BEL-URBANEYE | CAM-01 FRONT | FRAME #{self.frame_count:06d} | {time.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        draw.rectangle([(10, 10), (750, 45)], fill=(0, 0, 0, 180))
        draw.text((20, 18), hud_text, fill=(34, 197, 94))
        
        # Encode to JPEG buffer and base64
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=75)
        jpg_bytes = buffer.getvalue()
        b64_str = base64.b64encode(jpg_bytes).decode('utf-8')
        
        frame_arr = np.array(img)
        return True, frame_arr, f"data:image/jpeg;base64,{b64_str}"

    def release(self):
        self.is_open = False
