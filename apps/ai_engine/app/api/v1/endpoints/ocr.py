"""
OCR processing endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import OCRRequest, OCRResult, ProcessingJobResponse
from app.services.ai_service import ai_service
from app.services.job_service import job_service
from app.core.security import verify_django_request
from app.models.schemas import JobType, JobStatus

router = APIRouter()


@router.post("/", response_model=OCRResult)
async def process_ocr(
    request: OCRRequest,
    context: dict = Depends(verify_django_request)
):
    """Perform OCR on a document"""
    try:
        result = await ai_service.process_ocr(
            document_id=request.document_id,
            file_url=request.file_url,
            file_content=request.file_content,
            mime_type=request.mime_type,
            language=request.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/async", response_model=ProcessingJobResponse)
async def process_ocr_async(
    request: OCRRequest,
    context: dict = Depends(verify_django_request)
):
    """Perform OCR asynchronously (returns job)"""
    try:
        job = await job_service.create_job(
            tenant_id=request.tenant_id,
            job_type=JobType.OCR_PROCESSING,
            parameters={
                "document_id": request.document_id,
                "file_url": request.file_url,
                "mime_type": request.mime_type,
                "language": request.language
            }
        )
        
        # Process immediately
        result = await ai_service.process_ocr(
            document_id=request.document_id,
            file_url=request.file_url,
            file_content=request.file_content,
            mime_type=request.mime_type,
            language=request.language
        )
        
        await job_service.update_job_status(
            job_id=job.id,
            status=JobStatus.COMPLETED,
            results=result.dict()
        )
        
        return await job_service.get_job(job.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

