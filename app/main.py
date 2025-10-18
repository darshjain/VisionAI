# AI Camera Assistant - Backend Application

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
import logging
from dotenv import load_dotenv

from app.api import auth, camera, llm, websocket
from app.core.config import settings
from app.core.database import engine, Base
from app.services.camera_service import CameraService
from app.services.llm_service import LLMService
from app.services.websocket_service import WebSocketService

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="VisionAI",
    version="1.0.0",
    description="Production-ready AI Vision Assistant with JWT Authentication",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        ["*"] if settings.ALLOWED_ORIGINS == "*" else [settings.ALLOWED_ORIGINS]
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
camera_service = CameraService()
llm_service = LLMService()
websocket_service = WebSocketService()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(camera.router, prefix="/camera", tags=["camera"])
app.include_router(llm.router, prefix="/llm", tags=["llm"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])


# Direct WebSocket endpoint without router
@app.websocket("/ws-direct")
async def websocket_direct(websocket: WebSocket):
    """Direct WebSocket endpoint for testing"""
    await websocket.accept()
    websocket_service.add_client(websocket)
    logger = logging.getLogger(__name__)
    logger.info(
        f"Direct WebSocket client connected. Total clients: {len(websocket_service.connected_clients)}"
    )

    try:
        while True:
            # Send camera frames to all connected clients (15 FPS)
            if camera_service.is_active:
                frame_data = await camera_service.capture_frame()
                if frame_data:
                    await websocket.send_json(
                        {
                            "type": "frame",
                            "data": frame_data,
                            "timestamp": asyncio.get_event_loop().time(),
                        }
                    )
                    # Throttle to 15 FPS (66.67ms between frames)
                    await asyncio.sleep(1 / 15)

            # Process any incoming messages
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=0.1)

                if data.get("type") == "process_image":
                    try:
                        # Log the received data for debugging
                        logger.info(
                            f"Processing image with prompt: {data.get('prompt', 'No prompt')}"
                        )
                        logger.info(
                            f"Image data length: {len(data.get('image_data', ''))}"
                        )

                        # Process image with LLM
                        result = await llm_service.process_image_with_llm(
                            data.get("image_data"),
                            data.get(
                                "prompt",
                                "Analyze this image and provide helpful insights.",
                            ),
                        )

                        await websocket.send_json(
                            {"type": "llm_response", "data": result.dict()}
                        )
                    except Exception as e:
                        logger.error(f"LLM processing error: {e}")
                        await websocket.send_json(
                            {
                                "type": "error",
                                "message": f"Failed to process image: {str(e)}",
                            }
                        )

                elif data.get("type") == "chat_message":
                    try:
                        # Process text-only message with LLM
                        result = await llm_service.process_text_with_llm(
                            data.get("message", "")
                        )

                        await websocket.send_json(
                            {"type": "llm_response", "data": result.dict()}
                        )
                    except Exception as e:
                        logger.error(f"LLM text processing error: {e}")
                        await websocket.send_json(
                            {
                                "type": "error",
                                "message": f"Failed to process message: {str(e)}",
                            }
                        )

            except asyncio.TimeoutError:
                continue

    except WebSocketDisconnect:
        websocket_service.remove_client(websocket)
        logger.info(
            f"Direct WebSocket client disconnected. Total clients: {len(websocket_service.connected_clients)}"
        )


@app.get("/")
async def root():
    return {"message": "VisionAI API", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
