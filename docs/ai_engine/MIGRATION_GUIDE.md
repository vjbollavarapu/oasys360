# AI Engine Migration Guide

This document describes the separation of AI processing code from Django backend to a standalone FastAPI service.

## Architecture

### Before
- AI processing logic was embedded in Django `ai_processing` app
- All processing happened synchronously in Django views

### After
- FastAPI service (`ai_engine`) handles all AI processing
- Django backend acts as a client, making HTTP requests to AI Engine
- Clear separation of concerns

## Service Structure

```
apps/
├── backend/          # Django backend
│   └── ai_processing/
│       ├── client.py    # HTTP client for AI Engine
│       ├── models.py    # Django models (kept for data storage)
│       └── views.py     # Updated to use AI Engine client
└── ai_engine/        # FastAPI service (new)
    ├── app/
    │   ├── api/v1/      # API endpoints
    │   ├── models/      # Pydantic schemas
    │   ├── services/    # Business logic
    │   └── core/        # Configuration
    └── main.py          # FastAPI application
```

## Configuration

### Django Backend (.env)
```env
# AI Engine Service Configuration
AI_ENGINE_URL=http://localhost:8001
AI_ENGINE_API_KEY=your-api-key-here
AI_ENGINE_TIMEOUT=300
```

### AI Engine Service (.env)
```env
# Application Settings
PORT=8001
AI_ENGINE_API_KEY=your-api-key-here

# Django Backend URL
DJANGO_BACKEND_URL=http://localhost:8000

# AI Provider API Keys
OPENAI_API_KEY=your-openai-key
GOOGLE_API_KEY=your-google-key
```

## API Endpoints

### AI Engine Service (FastAPI)
- `POST /api/v1/categorization/` - Categorize document (sync)
- `POST /api/v1/extraction/` - Extract data (sync)
- `POST /api/v1/ocr/` - OCR processing (sync)
- `GET /api/v1/jobs/{job_id}` - Get job status
- `GET /health` - Health check

### Django Backend (unchanged URLs)
- All existing URLs remain the same
- Views now delegate to AI Engine service
- Models remain in Django for data persistence

## Running the Services

### Start AI Engine Service
```bash
cd apps/ai_engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### Start Django Backend
```bash
cd apps/backend
# Django will automatically use AI Engine via client.py
python manage.py runserver
```

## Migration Steps

1. ✅ Created FastAPI `ai_engine` service structure
2. ✅ Implemented AI processing endpoints
3. ✅ Created Django client (`ai_processing/client.py`)
4. ✅ Updated Django views to use AI Engine client
5. ⚠️ Fix model field name mismatches (status vs processing_status)
6. ⚠️ Add AI Engine configuration to Django settings
7. ⚠️ Update environment files
8. ⚠️ Test integration

## Next Steps

1. Fix Document model field references in views
2. Add proper error handling
3. Implement file upload/download between services
4. Add background job processing (Celery/RQ)
5. Add monitoring and logging
6. Write integration tests

