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
            # For development/testing, create a mock camera
            # In production, this would access the actual camera
            logger.info("Starting mock camera for development")

            # Simulate camera initialization
            self.camera = "mock_camera"  # Mock camera object
            self.is_active = True

            logger.info(
                f"Mock camera started with resolution {config.width}x{config.height}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to start camera: {e}")
            return False

    async def stop_camera(self):
        """Stop camera capture"""
        if self.camera:
            # For mock camera, just set to None
            if self.camera != "mock_camera":
                self.camera.release()
            self.camera = None
        self.is_active = False
        logger.info("Camera stopped")

    async def capture_frame(self):
        """Capture a single frame"""
        if not self.camera or not self.is_active:
            return None

        # For mock camera, return a placeholder frame
        if self.camera == "mock_camera":
            # Create a simple colored frame as base64
            import numpy as np

            # Create a 640x480 blue frame
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            frame[:, :] = [100, 150, 200]  # Blue color

            _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode("utf-8")
            return frame_base64

        # Real camera code would go here
        ret, frame = self.camera.read()
        if ret:
            _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode("utf-8")
            return frame_base64
        return None
