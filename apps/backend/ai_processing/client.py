"""
Django client for communicating with the AI Engine FastAPI service
"""
import requests
import logging
from typing import Dict, Any, Optional, List
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)


class AIEngineClient:
    """Client for communicating with the AI Engine FastAPI service"""
    
    def __init__(self):
        self.base_url = getattr(settings, 'AI_ENGINE_URL', 'http://localhost:8001')
        self.api_key = getattr(settings, 'AI_ENGINE_API_KEY', '')
        self.timeout = getattr(settings, 'AI_ENGINE_TIMEOUT', 300)
    
    def _get_headers(self, tenant_id: Optional[str] = None) -> Dict[str, str]:
        """Get request headers"""
        headers = {
            'Content-Type': 'application/json',
        }
        
        if self.api_key:
            headers['X-API-Key'] = self.api_key
        
        if tenant_id:
            headers['X-Tenant-ID'] = str(tenant_id)
        
        return headers
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        tenant_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Make HTTP request to AI Engine"""
        url = f"{self.base_url}/api/v1{endpoint}"
        headers = self._get_headers(tenant_id)
        
        try:
            response = requests.request(
                method=method,
                url=url,
                json=data,
                headers=headers,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"AI Engine request failed: {e}")
            raise Exception(f"AI Engine service error: {str(e)}")
    
    def categorize_document(
        self,
        document_id: str,
        tenant_id: str,
        file_url: Optional[str] = None,
        file_content: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        async_mode: bool = False
    ) -> Dict[str, Any]:
        """Categorize a document"""
        endpoint = "/categorization/async" if async_mode else "/categorization/"
        
        payload = {
            "document_id": str(document_id),
            "tenant_id": str(tenant_id),
            "file_url": file_url,
            "mime_type": mime_type
        }
        
        # Note: file_content would need to be handled differently (multipart/form-data)
        # For now, use file_url
        
        return self._make_request('POST', endpoint, payload, tenant_id)
    
    def extract_data(
        self,
        document_id: str,
        tenant_id: str,
        fields: List[str],
        file_url: Optional[str] = None,
        file_content: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        async_mode: bool = False
    ) -> Dict[str, Any]:
        """Extract structured data from a document"""
        endpoint = "/extraction/async" if async_mode else "/extraction/"
        
        payload = {
            "document_id": str(document_id),
            "tenant_id": str(tenant_id),
            "fields": fields,
            "file_url": file_url,
            "mime_type": mime_type
        }
        
        return self._make_request('POST', endpoint, payload, tenant_id)
    
    def process_ocr(
        self,
        document_id: str,
        tenant_id: str,
        file_url: Optional[str] = None,
        file_content: Optional[bytes] = None,
        mime_type: Optional[str] = None,
        language: str = "en",
        async_mode: bool = False
    ) -> Dict[str, Any]:
        """Perform OCR on a document"""
        endpoint = "/ocr/async" if async_mode else "/ocr/"
        
        payload = {
            "document_id": str(document_id),
            "tenant_id": str(tenant_id),
            "file_url": file_url,
            "mime_type": mime_type,
            "language": language
        }
        
        return self._make_request('POST', endpoint, payload, tenant_id)
    
    def get_job(self, job_id: str, tenant_id: str) -> Dict[str, Any]:
        """Get job status"""
        return self._make_request('GET', f"/jobs/{job_id}", tenant_id=tenant_id)
    
    def list_jobs(
        self,
        tenant_id: str,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """List jobs"""
        endpoint = f"/jobs/?limit={limit}"
        if status:
            endpoint += f"&status={status}"
        
        return self._make_request('GET', endpoint, tenant_id=tenant_id)
    
    def process_document(
        self,
        document_id: str,
        tenant_id: str,
        job_type: str,
        parameters: Optional[Dict[str, Any]] = None,
        priority: int = 5
    ) -> Dict[str, Any]:
        """Create a processing job"""
        payload = {
            "document_id": str(document_id),
            "tenant_id": str(tenant_id),
            "job_type": job_type,
            "parameters": parameters or {},
            "priority": priority
        }
        
        return self._make_request('POST', "/documents/process", payload, tenant_id)
    
    def detect_fraud(
        self,
        document_id: str,
        tenant_id: str,
        data: Dict[str, Any],
        transaction_amount: Optional[float] = None,
        transaction_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        async_mode: bool = False
    ) -> Dict[str, Any]:
        """Detect fraud in a transaction or document"""
        endpoint = "/fraud/async" if async_mode else "/fraud/"
        
        payload = {
            "document_id": str(document_id),
            "tenant_id": str(tenant_id),
            "data": data
        }
        
        if transaction_amount is not None:
            payload["transaction_amount"] = transaction_amount
        if transaction_type:
            payload["transaction_type"] = transaction_type
        if metadata:
            payload["metadata"] = metadata
        
        return self._make_request('POST', endpoint, payload, tenant_id)
    
    def forecast_financials(
        self,
        tenant_id: str,
        forecast_type: str,
        time_period: str,
        periods: int = 12,
        historical_data: Optional[Dict[str, Any]] = None,
        model_type: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate financial forecasts"""
        payload = {
            "tenant_id": str(tenant_id),
            "forecast_type": forecast_type,
            "time_period": time_period,
            "periods": periods
        }
        
        if historical_data:
            payload["historical_data"] = historical_data
        if model_type:
            payload["model_type"] = model_type
        if parameters:
            payload["parameters"] = parameters
        
        return self._make_request('POST', "/forecasting/", payload, tenant_id)
    
    def get_forecasting_models(self, tenant_id: str) -> Dict[str, Any]:
        """Get available forecasting models"""
        return self._make_request('GET', "/forecasting/models", tenant_id=tenant_id)
    
    def get_settings(self, tenant_id: str) -> Dict[str, Any]:
        """Get AI Engine settings"""
        return self._make_request('GET', "/settings/", tenant_id=tenant_id)
    
    def update_settings(
        self,
        tenant_id: str,
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update AI Engine settings"""
        return self._make_request('PUT', "/settings/", settings, tenant_id)
    
    def patch_settings(
        self,
        tenant_id: str,
        settings: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Partially update AI Engine settings"""
        return self._make_request('PATCH', "/settings/", settings, tenant_id)
    
    def health_check(self) -> bool:
        """Check if AI Engine service is healthy"""
        try:
            response = requests.get(
                f"{self.base_url}/health",
                timeout=5
            )
            return response.status_code == 200
        except:
            return False


# Singleton instance
ai_engine_client = AIEngineClient()

