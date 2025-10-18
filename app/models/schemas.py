# Pydantic schemas
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


class CameraConfig(BaseModel):
    width: int = 640
    height: int = 480
    fps: int = 15


class LLMRequest(BaseModel):
    image_data: str
    prompt: Optional[str] = None


class LLMTextRequest(BaseModel):
    prompt: str


class LLMResponse(BaseModel):
    response: str
    confidence: float
    processing_time: float


class AudioRequest(BaseModel):
    audio_data: str
    action: str  # 'transcribe' or 'play'


class AudioResponse(BaseModel):
    text: Optional[str] = None
    audio_data: Optional[str] = None
    success: bool
    message: str
