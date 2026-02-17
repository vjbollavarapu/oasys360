"""
AI Engine settings endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.models.schemas import AISettings, AISettingsResponse, ModelProvider
from app.core.security import verify_django_request
from app.core.config import settings

router = APIRouter()

# In-memory settings storage (in production, this would be in a database)
_ai_settings = AISettings(
    default_model_provider=ModelProvider.OPENAI,
    enable_async_processing=True,
    max_concurrent_jobs=10,
    job_timeout_seconds=300,
    enable_caching=True,
    cache_ttl_seconds=3600,
    api_rate_limit=100
)
_settings_updated_at = datetime.now()


@router.get("/", response_model=AISettingsResponse)
async def get_settings(
    context: dict = Depends(verify_django_request)
):
    """Get AI Engine settings"""
    try:
        return AISettingsResponse(
            settings=_ai_settings,
            updated_at=_settings_updated_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/", response_model=AISettingsResponse)
async def update_settings(
    new_settings: AISettings,
    context: dict = Depends(verify_django_request)
):
    """Update AI Engine settings"""
    try:
        global _ai_settings, _settings_updated_at
        
        # Update settings
        _ai_settings = new_settings
        _settings_updated_at = datetime.now()
        
        return AISettingsResponse(
            settings=_ai_settings,
            updated_at=_settings_updated_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/", response_model=AISettingsResponse)
async def patch_settings(
    settings_update: dict,
    context: dict = Depends(verify_django_request)
):
    """Partially update AI Engine settings"""
    try:
        global _ai_settings, _settings_updated_at
        
        # Update only provided fields
        settings_dict = _ai_settings.dict()
        settings_dict.update(settings_update)
        _ai_settings = AISettings(**settings_dict)
        _settings_updated_at = datetime.now()
        
        return AISettingsResponse(
            settings=_ai_settings,
            updated_at=_settings_updated_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

