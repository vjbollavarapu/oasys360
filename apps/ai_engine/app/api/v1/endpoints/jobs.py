"""
Job management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from app.models.schemas import ProcessingJobResponse, JobStatus
from app.services.job_service import job_service
from app.core.security import verify_django_request

router = APIRouter()


@router.get("/{job_id}", response_model=ProcessingJobResponse)
async def get_job(
    job_id: str,
    context: dict = Depends(verify_django_request)
):
    """Get job by ID"""
    tenant_id = context.get("tenant_id")
    job = await job_service.get_job(job_id, tenant_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job


@router.get("/", response_model=List[ProcessingJobResponse])
async def list_jobs(
    status: Optional[JobStatus] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    context: dict = Depends(verify_django_request)
):
    """List jobs"""
    tenant_id = context.get("tenant_id")
    jobs = await job_service.list_jobs(tenant_id=tenant_id, status=status, limit=limit)
    return jobs

