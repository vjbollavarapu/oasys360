"""
Health check endpoints
"""
from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        service="ai_engine",
        version="1.0.0",
        timestamp=datetime.utcnow()
    )

