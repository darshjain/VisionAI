# Configuration management
import os
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "AI Camera Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG_MODE: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./ai_camera_assistant.db"
    DATABASE_ECHO: bool = False
    
    # JWT Authentication
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Security Settings
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALLOWED_ORIGINS: List[str] = ["*"]
    CORS_ENABLED: bool = True
    BCRYPT_ROUNDS: int = 12
    
    # LLM Configuration
    OLLAMA_URL: str = "http://ollama:11434"
    MODEL_NAME: str = "llava:7b"
    WHISPER_MODEL: str = "whisper:latest"
    GPU_ENABLED: bool = True
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.7
    
    # Camera Settings
    CAMERA_WIDTH: int = 640
    CAMERA_HEIGHT: int = 480
    CAMERA_FPS: int = 30
    CAMERA_DEVICE: int = 0
    FRAME_QUALITY: int = 80
    
    # Audio Settings
    AUDIO_SAMPLE_RATE: int = 44100
    AUDIO_CHANNELS: int = 1
    AUDIO_CHUNK_SIZE: int = 1024
    AUDIO_FORMAT: int = 16
    MICROPHONE_ENABLED: bool = True
    SPEAKER_ENABLED: bool = True
    
    # Performance Settings
    MAX_CONNECTIONS: int = 10
    PROCESSING_TIMEOUT: int = 30
    FRAME_BUFFER_SIZE: int = 5
    AUDIO_BUFFER_SIZE: int = 10
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10485760
    ALLOWED_FILE_TYPES: List[str] = ["jpg", "jpeg", "png", "gif", "mp3", "wav", "mp4"]
    
    # Development Settings
    RELOAD_ON_CHANGE: bool = True
    AUTO_MIGRATE: bool = True
    CREATE_DEFAULT_USER: bool = True
    DEFAULT_USERNAME: str = "admin"
    DEFAULT_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
