"""
Pydantic schemas for request/response models
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class JobType(str, Enum):
    """AI Processing Job Types"""
    DOCUMENT_CATEGORIZATION = "document_categorization"
    DATA_EXTRACTION = "data_extraction"
    OCR_PROCESSING = "ocr_processing"
    FRAUD_DETECTION = "fraud_detection"
    ANOMALY_DETECTION = "anomaly_detection"
    MODEL_RETRAINING = "model_retraining"


class JobStatus(str, Enum):
    """Job Status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DocumentType(str, Enum):
    """Document Types"""
    INVOICE = "invoice"
    RECEIPT = "receipt"
    BANK_STATEMENT = "bank_statement"
    CONTRACT = "contract"
    EXPENSE_REPORT = "expense_report"
    TAX_DOCUMENT = "tax_document"
    OTHER = "other"


class ModelProvider(str, Enum):
    """AI Model Providers"""
    OPENAI = "openai"
    GOOGLE = "google"
    AZURE = "azure"
    AWS = "aws"
    CUSTOM = "custom"


class ModelType(str, Enum):
    """AI Model Types"""
    CATEGORIZATION = "categorization"
    EXTRACTION = "extraction"
    OCR = "ocr"
    FRAUD_DETECTION = "fraud_detection"
    ANOMALY_DETECTION = "anomaly_detection"


# Request Schemas
class DocumentProcessRequest(BaseModel):
    """Request to process a document"""
    document_id: str = Field(..., description="Document identifier")
    tenant_id: str = Field(..., description="Tenant identifier")
    job_type: JobType = Field(..., description="Type of processing job")
    parameters: Optional[Dict[str, Any]] = Field(default={}, description="Processing parameters")
    extraction_fields: Optional[List[str]] = Field(default=[], description="Fields to extract")
    priority: int = Field(default=5, ge=1, le=9, description="Job priority (1-9)")


class DocumentCategorizeRequest(BaseModel):
    """Request to categorize a document"""
    document_id: str
    tenant_id: str
    file_url: Optional[str] = None
    file_content: Optional[bytes] = None
    mime_type: Optional[str] = None


class DocumentExtractRequest(BaseModel):
    """Request to extract data from a document"""
    document_id: str
    tenant_id: str
    file_url: Optional[str] = None
    file_content: Optional[bytes] = None
    mime_type: Optional[str] = None
    fields: List[str] = Field(default=[], description="Fields to extract")


class OCRRequest(BaseModel):
    """Request for OCR processing"""
    document_id: str
    tenant_id: str
    file_url: Optional[str] = None
    file_content: Optional[bytes] = None
    mime_type: Optional[str] = None
    language: Optional[str] = Field(default="en", description="Language code")


# Response Schemas
class CategorizationResult(BaseModel):
    """Document categorization result"""
    document_id: str
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    ai_model: str
    model_version: Optional[str] = None
    processing_time: Optional[float] = None
    raw_response: Optional[Dict[str, Any]] = None


class ExtractionResult(BaseModel):
    """Data extraction result"""
    document_id: str
    field_name: str
    field_value: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: Optional[Dict[str, Any]] = None
    ai_model: str
    model_version: Optional[str] = None


class ExtractionResponse(BaseModel):
    """Response containing multiple extraction results"""
    document_id: str
    extracted_data: Dict[str, Any]
    results: List[ExtractionResult]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    processing_time: Optional[float] = None


class OCRResult(BaseModel):
    """OCR processing result"""
    document_id: str
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_boxes: Optional[List[Dict[str, Any]]] = None
    processing_time: Optional[float] = None


class ProcessingJobResponse(BaseModel):
    """AI Processing Job response"""
    id: str
    tenant_id: str
    job_type: JobType
    status: JobStatus
    priority: int
    parameters: Dict[str, Any]
    results: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AIModelInfo(BaseModel):
    """AI Model information"""
    id: str
    name: str
    version: str
    model_type: ModelType
    provider: ModelProvider
    model_id: str
    is_active: bool
    is_default: bool
    configuration: Dict[str, Any]
    performance_metrics: Dict[str, Any]


class ProcessingStats(BaseModel):
    """Processing statistics"""
    total_jobs: int
    completed_jobs: int
    failed_jobs: int
    pending_jobs: int
    average_processing_time: Optional[float] = None
    success_rate: float = Field(..., ge=0.0, le=1.0)


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    timestamp: datetime


class FraudDetectionRequest(BaseModel):
    """Request for fraud detection"""
    document_id: str
    tenant_id: str
    data: Dict[str, Any] = Field(..., description="Data to analyze for fraud")
    transaction_amount: Optional[float] = None
    transaction_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class FraudDetectionResult(BaseModel):
    """Fraud detection result"""
    document_id: str
    is_fraud: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    risk_score: float = Field(..., ge=0.0, le=1.0)
    indicators: List[str] = Field(default=[], description="Fraud indicators found")
    explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    processing_time: Optional[float] = None


class ForecastingRequest(BaseModel):
    """Request for financial forecasting"""
    tenant_id: str
    forecast_type: str = Field(..., description="Type of forecast: revenue, expenses, cash_flow, etc.")
    time_period: str = Field(..., description="Forecast period: daily, weekly, monthly, quarterly, yearly")
    periods: int = Field(default=12, ge=1, le=120, description="Number of periods to forecast")
    historical_data: Optional[Dict[str, Any]] = None
    model_type: Optional[str] = Field(default="linear", description="Forecast model type")
    parameters: Optional[Dict[str, Any]] = None


class ForecastingResult(BaseModel):
    """Financial forecasting result"""
    tenant_id: str
    forecast_type: str
    time_period: str
    periods: int
    forecasts: List[Dict[str, Any]] = Field(..., description="Forecasted values for each period")
    confidence_intervals: Optional[List[Dict[str, Any]]] = None
    accuracy_metrics: Optional[Dict[str, Any]] = None
    model_used: str
    processing_time: Optional[float] = None


class AISettings(BaseModel):
    """AI Engine Settings"""
    default_model_provider: ModelProvider
    default_categorization_model: Optional[str] = None
    default_extraction_model: Optional[str] = None
    default_ocr_model: Optional[str] = None
    enable_async_processing: bool = Field(default=True)
    max_concurrent_jobs: int = Field(default=10, ge=1, le=100)
    job_timeout_seconds: int = Field(default=300, ge=60, le=3600)
    enable_caching: bool = Field(default=True)
    cache_ttl_seconds: int = Field(default=3600, ge=60)
    api_rate_limit: int = Field(default=100, ge=1, description="Requests per minute")


class AISettingsResponse(BaseModel):
    """AI Engine Settings Response"""
    settings: AISettings
    updated_at: datetime

