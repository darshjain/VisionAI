# Camera API router
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import CameraConfig
from app.core.database import get_db
from app.services.camera_service import CameraService
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()
camera_service = CameraService()


@router.post("/start")
async def start_camera(
    config: CameraConfig,
    db: Session = Depends(get_db),
    # Temporarily remove auth requirement for testing
    # current_user: User = Depends(get_current_active_user)
):
    """Start camera capture"""
    try:
        success = await camera_service.start_camera(config)
        if success:
            return {"status": "success", "message": "Camera started"}
        else:
            raise HTTPException(status_code=500, detail="Failed to start camera")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop")
async def stop_camera(
    db: Session = Depends(get_db),
    # Temporarily remove auth requirement for testing
    # current_user: User = Depends(get_current_active_user)
):
    """Stop camera capture"""
    try:
        await camera_service.stop_camera()
        return {"status": "success", "message": "Camera stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def camera_status(
    db: Session = Depends(get_db),
    # Temporarily remove auth requirement for testing
    # current_user: User = Depends(get_current_active_user)
):
    """Get camera status"""
    return {
        "is_active": camera_service.is_active,
        "has_camera": camera_service.camera is not None,
    }
