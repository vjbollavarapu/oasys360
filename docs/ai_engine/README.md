# AI Engine Service

FastAPI microservice for AI processing operations including document categorization, extraction, OCR, and more.

## Features

- Document categorization using AI
- Structured data extraction from documents
- OCR processing
- Fraud detection
- Anomaly detection
- Async job processing
- RESTful API

## Setup

### Prerequisites

- Python 3.11+
- Virtual environment (recommended)

### Installation

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration (API keys, etc.)

### Running the Service

Development mode:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

Production mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Docker

Build and run with Docker:

```bash
docker build -t ai-engine .
docker run -p 8001:8001 --env-file .env ai-engine
```

## Endpoints

### Health
- `GET /health` - Health check

### Documents
- `POST /api/v1/documents/process` - Process a document

### Categorization
- `POST /api/v1/categorization/` - Categorize document (sync)
- `POST /api/v1/categorization/async` - Categorize document (async)

### Extraction
- `POST /api/v1/extraction/` - Extract data (sync)
- `POST /api/v1/extraction/async` - Extract data (async)

### OCR
- `POST /api/v1/ocr/` - OCR processing (sync)
- `POST /api/v1/ocr/async` - OCR processing (async)

### Jobs
- `GET /api/v1/jobs/` - List jobs
- `GET /api/v1/jobs/{job_id}` - Get job status

### Models
- `GET /api/v1/models/` - List available AI models

## Integration with Django Backend

The Django backend communicates with this service via HTTP requests. See the Django client implementation in `apps/backend/ai_processing/client.py`.

## Environment Variables

See `.env.example` for all available configuration options.

