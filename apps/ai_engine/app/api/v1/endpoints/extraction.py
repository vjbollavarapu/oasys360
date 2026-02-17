"""
Data extraction endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import (
    DocumentExtractRequest,
    ExtractionResponse,
    ProcessingJobResponse
)
from app.services.ai_service import ai_service
from app.services.job_service import job_service
from app.core.security import verify_django_request
from app.models.schemas import JobType, JobStatus

router = APIRouter()


@router.post("/", response_model=ExtractionResponse)
async def extract_data(
    request: DocumentExtractRequest,
    context: dict = Depends(verify_django_request)
):
    """Extract structured data from a document"""
    try:
        result = await ai_service.extract_data(
            document_id=request.document_id,
            fields=request.fields,
            file_url=request.file_url,
            file_content=request.file_content,
            mime_type=request.mime_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/async", response_model=ProcessingJobResponse)
async def extract_data_async(
    request: DocumentExtractRequest,
    context: dict = Depends(verify_django_request)
):
    """Extract data asynchronously (returns job)"""
    try:
        job = await job_service.create_job(
            tenant_id=request.tenant_id,
            job_type=JobType.DATA_EXTRACTION,
            parameters={
                "document_id": request.document_id,
                "fields": request.fields,
                "file_url": request.file_url,
                "mime_type": request.mime_type
            }
        )
        
        # Process immediately (would be async in production)
        result = await ai_service.extract_data(
            document_id=request.document_id,
            fields=request.fields,
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

