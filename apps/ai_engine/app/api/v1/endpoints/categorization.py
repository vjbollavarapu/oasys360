"""
Document categorization endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.models.schemas import (
    DocumentCategorizeRequest,
    CategorizationResult,
    ProcessingJobResponse
)
from app.services.ai_service import ai_service
from app.services.job_service import job_service
from app.core.security import verify_django_request
from app.models.schemas import JobType, JobStatus

router = APIRouter()


@router.post("/", response_model=CategorizationResult)
async def categorize_document(
    request: DocumentCategorizeRequest,
    context: dict = Depends(verify_django_request)
):
    """Categorize a document"""
    try:
        result = await ai_service.categorize_document(
            document_id=request.document_id,
            file_url=request.file_url,
            file_content=request.file_content,
            mime_type=request.mime_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/async", response_model=ProcessingJobResponse)
async def categorize_document_async(
    request: DocumentCategorizeRequest,
    context: dict = Depends(verify_django_request)
):
    """Categorize a document asynchronously (returns job)"""
    try:
        job = await job_service.create_job(
            tenant_id=request.tenant_id,
            job_type=JobType.DOCUMENT_CATEGORIZATION,
            parameters={
                "document_id": request.document_id,
                "file_url": request.file_url,
                "mime_type": request.mime_type
            }
        )
        
        # In production, this would be handled by a background worker
        # For now, process immediately
        result = await ai_service.categorize_document(
            document_id=request.document_id,
            file_url=request.file_url,
            file_content=request.file_content,
            mime_type=request.mime_type
        )
        
        await job_service.update_job_status(
            job_id=job.id,
            status=JobStatus.COMPLETED,
            results=result.dict()
        )
        
        return await job_service.get_job(job.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

