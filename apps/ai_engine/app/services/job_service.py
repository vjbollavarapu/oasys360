"""
Job Management Service
Handles AI processing job lifecycle
"""
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from app.models.schemas import JobType, JobStatus, ProcessingJobResponse
import asyncio

logger = logging.getLogger(__name__)


class JobService:
    """Service for managing AI processing jobs"""
    
    def __init__(self):
        # In-memory job storage (use Redis or DB in production)
        self.jobs: Dict[str, Dict[str, Any]] = {}
    
    async def create_job(
        self,
        tenant_id: str,
        job_type: JobType,
        parameters: Dict[str, Any],
        priority: int = 5
    ) -> ProcessingJobResponse:
        """Create a new processing job"""
        job_id = str(uuid.uuid4())
        
        job_data = {
            "id": job_id,
            "tenant_id": tenant_id,
            "job_type": job_type,
            "status": JobStatus.PENDING,
            "priority": priority,
            "parameters": parameters,
            "results": None,
            "error_message": None,
            "started_at": None,
            "completed_at": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        self.jobs[job_id] = job_data
        
        logger.info(f"Created job {job_id} of type {job_type} for tenant {tenant_id}")
        
        return ProcessingJobResponse(**job_data)
    
    async def get_job(self, job_id: str, tenant_id: Optional[str] = None) -> Optional[ProcessingJobResponse]:
        """Get job by ID"""
        job = self.jobs.get(job_id)
        
        if not job:
            return None
        
        if tenant_id and job["tenant_id"] != tenant_id:
            return None
        
        return ProcessingJobResponse(**job)
    
    async def update_job_status(
        self,
        job_id: str,
        status: JobStatus,
        results: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None
    ) -> Optional[ProcessingJobResponse]:
        """Update job status"""
        job = self.jobs.get(job_id)
        
        if not job:
            return None
        
        job["status"] = status
        job["updated_at"] = datetime.utcnow()
        
        if status == JobStatus.PROCESSING and not job["started_at"]:
            job["started_at"] = datetime.utcnow()
        
        if status in [JobStatus.COMPLETED, JobStatus.FAILED]:
            job["completed_at"] = datetime.utcnow()
        
        if results:
            job["results"] = results
        
        if error_message:
            job["error_message"] = error_message
        
        return ProcessingJobResponse(**job)
    
    async def list_jobs(
        self,
        tenant_id: Optional[str] = None,
        status: Optional[JobStatus] = None,
        limit: int = 50
    ) -> list[ProcessingJobResponse]:
        """List jobs with optional filters"""
        jobs = list(self.jobs.values())
        
        if tenant_id:
            jobs = [j for j in jobs if j["tenant_id"] == tenant_id]
        
        if status:
            jobs = [j for j in jobs if j["status"] == status]
        
        # Sort by priority and created_at
        jobs.sort(key=lambda x: (-x["priority"], -x["created_at"].timestamp()))
        
        return [ProcessingJobResponse(**j) for j in jobs[:limit]]
    
    async def process_job(self, job_id: str) -> ProcessingJobResponse:
        """
        Process a job (would be called by background worker in production)
        This is a simplified synchronous processing
        """
        job = self.jobs.get(job_id)
        
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        await self.update_job_status(job_id, JobStatus.PROCESSING)
        
        # Simulate processing
        await asyncio.sleep(1)
        
        # Mock results
        results = {
            "processed": True,
            "job_type": job["job_type"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.update_job_status(job_id, JobStatus.COMPLETED, results=results)
        
        return await self.get_job(job_id)


# Singleton instance
job_service = JobService()

