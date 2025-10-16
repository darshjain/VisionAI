# AI Camera Assistant - Backend Application

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.api import auth, camera, llm, websocket
from app.core.config import settings
from app.core.database import engine, Base

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

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(camera.router, prefix="/camera", tags=["camera"])
app.include_router(llm.router, prefix="/llm", tags=["llm"])
app.include_router(websocket.router, prefix="/ws", tags=["websocket"])


@app.get("/")
async def root():
    return {"message": "VisionAI API", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
