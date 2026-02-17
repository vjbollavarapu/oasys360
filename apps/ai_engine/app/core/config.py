"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "AI Engine Service"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8001"))
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    API_KEY: str = os.getenv("AI_ENGINE_API_KEY", "")
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://localhost:8000"
    ).split(",")
    
    # Django Backend
    DJANGO_BACKEND_URL: str = os.getenv("DJANGO_BACKEND_URL", "http://localhost:8000")
    
    # AI Provider Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    AZURE_OPENAI_KEY: str = os.getenv("AZURE_OPENAI_KEY", "")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    
    # Database (if needed for job tracking)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Redis (for caching/job queues)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    
    # Processing Settings
    MAX_CONCURRENT_JOBS: int = int(os.getenv("MAX_CONCURRENT_JOBS", "10"))
    DEFAULT_TIMEOUT: int = int(os.getenv("DEFAULT_TIMEOUT", "300"))  # 5 minutes
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

