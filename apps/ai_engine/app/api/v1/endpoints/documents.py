"""
Document processing endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from app.models.schemas import DocumentProcessRequest, ProcessingJobResponse
from app.services.job_service import job_service
from app.core.security import verify_django_request

router = APIRouter()


@router.post("/process", response_model=ProcessingJobResponse)
async def process_document(
    request: DocumentProcessRequest,
    context: dict = Depends(verify_django_request)
):
    """Process a document with AI"""
    try:
        job = await job_service.create_job(
            tenant_id=request.tenant_id,
            job_type=request.job_type,
            parameters=request.parameters,
            priority=request.priority
        )
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

