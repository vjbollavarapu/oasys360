"""
API Router for v1 endpoints
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    documents,
    categorization,
    extraction,
    ocr,
    jobs,
    models,
    health,
    fraud,
    forecasting,
    settings
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(categorization.router, prefix="/categorization", tags=["categorization"])
api_router.include_router(extraction.router, prefix="/extraction", tags=["extraction"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(fraud.router, prefix="/fraud", tags=["fraud"])
api_router.include_router(forecasting.router, prefix="/forecasting", tags=["forecasting"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])

