"""
AI Model management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.models.schemas import AIModelInfo, ModelType, ModelProvider
from app.core.security import verify_django_request

router = APIRouter()


@router.get("/", response_model=List[AIModelInfo])
async def list_models(
    model_type: Optional[ModelType] = None,
    provider: Optional[ModelProvider] = None,
    context: dict = Depends(verify_django_request)
):
    """List available AI models"""
    # TODO: Implement model listing from database or configuration
    # This is a placeholder
    
    models = [
        AIModelInfo(
            id="openai-gpt4-vision-1",
            name="GPT-4 Vision",
            version="1.0",
            model_type=ModelType.CATEGORIZATION,
            provider=ModelProvider.OPENAI,
            model_id="gpt-4-vision-preview",
            is_active=True,
            is_default=True,
            configuration={},
            performance_metrics={}
        ),
        AIModelInfo(
            id="google-document-ai-1",
            name="Google Document AI",
            version="1.0",
            model_type=ModelType.EXTRACTION,
            provider=ModelProvider.GOOGLE,
            model_id="document-ai",
            is_active=True,
            is_default=True,
            configuration={},
            performance_metrics={}
        )
    ]
    
    if model_type:
        models = [m for m in models if m.model_type == model_type]
    
    if provider:
        models = [m for m in models if m.provider == provider]
    
    return models


@router.get("/{model_id}", response_model=AIModelInfo)
async def get_model(
    model_id: str,
    context: dict = Depends(verify_django_request)
):
    """Get model by ID"""
    # TODO: Implement model retrieval from database
    raise HTTPException(status_code=501, detail="Not implemented")

