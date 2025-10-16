# WebSocket API router
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import asyncio
import logging
from app.core.database import get_db
from app.services.camera_service import CameraService
from app.services.llm_service import LLMService
from app.services.websocket_service import WebSocketService

router = APIRouter()
logger = logging.getLogger(__name__)

camera_service = CameraService()
llm_service = LLMService()
websocket_service = WebSocketService()

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    websocket_service.add_client(websocket)
    logger.info(f"Client connected. Total clients: {len(websocket_service.connected_clients)}")
    
    try:
        while True:
            # Send camera frames to all connected clients
            if camera_service.is_active:
                frame_data = await camera_service.capture_frame()
                if frame_data:
                    await websocket.send_json({
                        "type": "frame",
                        "data": frame_data,
                        "timestamp": asyncio.get_event_loop().time()
                    })
            
            # Process any incoming messages
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=0.1)
                
                if data.get("type") == "process_image":
                    try:
                        # Process image with LLM
                        result = await llm_service.process_image_with_llm(
                            data.get("image_data"),
                            data.get("prompt", "Analyze this image and provide helpful insights.")
                        )
                        
                        await websocket.send_json({
                            "type": "llm_response",
                            "data": result.dict()
                        })
                    except Exception as e:
                        logger.error(f"LLM processing error: {e}")
                        await websocket.send_json({
                            "type": "error",
                            "message": f"Failed to process image: {str(e)}"
                        })
                    
            except asyncio.TimeoutError:
                continue
                
    except WebSocketDisconnect:
        websocket_service.remove_client(websocket)
        logger.info(f"Client disconnected. Total clients: {len(websocket_service.connected_clients)}")
