# LLM API router
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import LLMRequest, LLMTextRequest, LLMResponse
from app.core.database import get_db
from app.services.llm_service import LLMService
from app.api.auth import get_current_active_user
from app.models.user import User

router = APIRouter()
llm_service = LLMService()


@router.get("/status")
async def llm_status(
    db: Session = Depends(get_db),
    # Temporarily remove auth requirement for testing
    # current_user: User = Depends(get_current_active_user)
):
    """Get LLM service status"""
    try:
        status = await llm_service.get_status()
        return status
    except Exception as e:
        return {
            "status": "unavailable",
            "error": str(e),
            "ollama_url": llm_service.ollama_url,
        }


@router.post("/process", response_model=LLMResponse)
async def process_with_llm(
    request: LLMRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Process image with LLM"""
    try:
        result = await llm_service.process_image_with_llm(
            request.image_data, request.prompt
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=LLMResponse)
async def chat_with_llm(
    request: LLMTextRequest,
    db: Session = Depends(get_db),
    # Temporarily remove auth requirement for testing
    # current_user: User = Depends(get_current_active_user),
):
    """Process text-only message with LLM"""
    try:
        result = await llm_service.process_text_with_llm(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
