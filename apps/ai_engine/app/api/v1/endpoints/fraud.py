"""
Fraud detection endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import (
    FraudDetectionRequest,
    FraudDetectionResult,
    ProcessingJobResponse,
    JobType,
    JobStatus
)
from app.services.ai_service import ai_service
from app.services.job_service import job_service
from app.core.security import verify_django_request

router = APIRouter()


@router.post("/", response_model=FraudDetectionResult)
async def detect_fraud(
    request: FraudDetectionRequest,
    context: dict = Depends(verify_django_request)
):
    """Detect fraud in a transaction or document"""
    try:
        result = await ai_service.detect_fraud(
            document_id=request.document_id,
            data=request.data
        )
        
        # Enhance result with request data
        fraud_result = FraudDetectionResult(
            document_id=request.document_id,
            is_fraud=result.get("is_fraud", False),
            confidence=result.get("confidence", 0.0),
            risk_score=result.get("risk_score", 0.0),
            indicators=result.get("indicators", []),
            explanation=result.get("explanation"),
            recommended_action=result.get("recommended_action")
        )
        
        return fraud_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/async", response_model=ProcessingJobResponse)
async def detect_fraud_async(
    request: FraudDetectionRequest,
    context: dict = Depends(verify_django_request)
):
    """Detect fraud asynchronously (returns job)"""
    try:
        job = await job_service.create_job(
            tenant_id=request.tenant_id,
            job_type=JobType.FRAUD_DETECTION,
            parameters={
                "document_id": request.document_id,
                "data": request.data,
                "transaction_amount": request.transaction_amount,
                "transaction_type": request.transaction_type,
                "metadata": request.metadata
            }
        )
        
        # In production, this would be handled by a background worker
        # For now, process immediately
        result = await ai_service.detect_fraud(
            document_id=request.document_id,
            data=request.data
        )
        
        await job_service.update_job_status(
            job_id=job.id,
            status=JobStatus.COMPLETED,
            results=result
        )
        
        return await job_service.get_job(job.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

