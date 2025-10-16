# Camera service
import cv2
import base64
import logging
from typing import Optional
from app.models.schemas import CameraConfig

logger = logging.getLogger(__name__)

class CameraService:
    def __init__(self):
        self.camera = None
        self.is_active = False
        
    async def start_camera(self, config: CameraConfig):
        """Start camera capture"""
        try:
            self.camera = cv2.VideoCapture(0)
            if not self.camera.isOpened():
                raise Exception("Could not open camera")
                
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, config.width)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, config.height)
            self.camera.set(cv2.CAP_PROP_FPS, config.fps)
            
            self.is_active = True
            logger.info(f"Camera started with resolution {config.width}x{config.height}")
            return True
        except Exception as e:
            logger.error(f"Failed to start camera: {e}")
            return False
    
    async def stop_camera(self):
        """Stop camera capture"""
        if self.camera:
            self.camera.release()
            self.camera = None
        self.is_active = False
        logger.info("Camera stopped")
    
    async def capture_frame(self):
        """Capture a single frame"""
        if not self.camera or not self.is_active:
            return None
            
        ret, frame = self.camera.read()
        if ret:
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            return frame_base64
        return None
