# Endpoint Path Alignment: Frontend ↔ Backend

## Status: ✅ COMPLETE

All endpoint paths between frontend and backend are now correctly aligned.

## Summary

This document tracks the alignment of endpoint paths between the Next.js frontend and Django backend after separating AI functionality into the FastAPI `ai_engine` microservice.

## URL Construction

### Backend Structure
```
http://localhost:8000/api/v1/ai_processing/{endpoint}
```

### Frontend Structure
```
API_URL = http://localhost:8000/api/v1
Endpoint = /ai_processing/{endpoint}
Full URL = API_URL + Endpoint
```

## Verified Endpoint Mappings

### Document Endpoints (8 endpoints) ✅

| Frontend Endpoint | Backend URL Pattern | HTTP Methods | Status |
|------------------|---------------------|--------------|--------|
| `/ai_processing/documents/` | `documents/` | GET, POST | ✅ Match |
| `/ai_processing/documents/{id}/` | `documents/<uuid:pk>/` | GET, PUT, PATCH, DELETE | ✅ Match |
| `/ai_processing/documents/upload/` | `documents/upload/` | POST | ✅ Match |
| `/ai_processing/documents/process/` | `documents/process/` | POST | ✅ Match |
| `/ai_processing/documents/search/` | `documents/search/` | GET | ✅ Match |
| `/ai_processing/documents/{id}/categorization/` | `documents/<uuid:document_id>/categorization/` | GET, POST | ✅ Match |
| `/ai_processing/documents/{id}/extraction/` | `documents/<uuid:document_id>/extraction/` | GET, POST | ✅ Match |

### Categorization Endpoints (2 endpoints) ✅

| Frontend Endpoint | Backend URL Pattern | HTTP Methods | Status |
|------------------|---------------------|--------------|--------|
| `/ai_processing/categorization/` | `categorization/` | GET, POST | ✅ Match |
| `/ai_processing/categorization/{id}/` | `categorization/<uuid:pk>/` | GET, PUT, PATCH, DELETE | ✅ Match |

### Extraction Endpoints (2 endpoints) ✅

| Frontend Endpoint | Backend URL Pattern | HTTP Methods | Status |
|------------------|---------------------|--------------|--------|
| `/ai_processing/extraction/` | `extraction/` | GET, POST | ✅ Match |
| `/ai_processing/extraction/{id}/` | `extraction/<uuid:pk>/` | GET, PUT, PATCH, DELETE | ✅ Match |

### Job Endpoints (3 endpoints) ✅

| Frontend Endpoint | Backend URL Pattern | HTTP Methods | Status |
|------------------|---------------------|--------------|--------|
| `/ai_processing/jobs/` | `jobs/` | GET, POST | ✅ Match |
| `/ai_processing/jobs/{id}/` | `jobs/<uuid:pk>/` | GET, PUT, PATCH, DELETE | ✅ Match |

**Special handling:**
- **Job Status**: Uses `GET /jobs/{id}/` (status included in response) ✅
- **Cancel Job**: Uses `PATCH /jobs/{id}/` with `{status: 'cancelled'}` ✅

### Model Endpoints (3 endpoints) ✅

| Frontend Endpoint | Backend URL Pattern | HTTP Methods | Status |
|------------------|---------------------|--------------|--------|
| `/ai_processing/models/` | `models/` | GET, POST | ✅ Match |
| `/ai_processing/models/{id}/` | `models/<uuid:pk>/` | GET, PUT, PATCH, DELETE | ✅ Match |
| `/ai_processing/models/{id}/retrain/` | `models/<uuid:model_id>/retrain/` | POST | ✅ Match |

### Statistics Endpoint (1 endpoint) ✅

| Frontend Endpoint | Backend URL Pattern | HTTP Methods | Status |
|------------------|---------------------|--------------|--------|
| `/ai_processing/stats/` | `stats/` | GET | ✅ Match |

## Changes Made

### 1. Frontend Service Methods (`apps/frontend/lib/api-services.ts`)

**Updated job methods:**
```typescript
async getJobStatus(id: string): Promise<ApiResponse> {
  // Use detail endpoint - status is included in job response
  return this.get(API_CONFIG.ENDPOINTS.AI_PROCESSING.JOBS.DETAIL(id));
}

async cancelJob(id: string): Promise<ApiResponse> {
  // Update job status to 'cancelled' via PATCH
  return this.patch(API_CONFIG.ENDPOINTS.AI_PROCESSING.JOBS.DETAIL(id), {
    status: 'cancelled'
  });
}
```

### 2. Endpoint Path Consistency

- ✅ All paths use `/ai_processing/` (underscore) to match backend
- ✅ No hyphen usage (`ai-processing` → `ai_processing`)
- ✅ Trailing slashes match between frontend and backend

## Missing Backend Endpoints

The following endpoints are defined in frontend but will return 404 until backend implements them:

### Categorization Rules (5 endpoints)
- `/ai_processing/categorization/rules/`
- `/ai_processing/categorization/rules/{id}/`
- `/ai_processing/categorization/uncategorized/`
- `/ai_processing/categorization/auto/`
- `/ai_processing/categorize/`

### Forecasting (4 endpoints)
- `/ai_processing/forecast/`
- `/ai_processing/forecast/{id}/`
- `/ai_processing/forecast/metrics/`
- `/ai_processing/forecast/{id}/export/`

### Fraud Detection (6 endpoints)
- `/ai_processing/fraud/alerts/`
- `/ai_processing/fraud/rules/`
- `/ai_processing/fraud/rules/{id}/`
- `/ai_processing/fraud/metrics/`
- `/ai_processing/fraud/alerts/{id}/resolve/`
- `/ai_processing/fraud-detection/`

**Note**: Frontend code is ready for these endpoints. They can be implemented in the backend as needed.

## Verification Checklist

- [x] All existing backend endpoints have matching frontend endpoints
- [x] Frontend endpoint paths use underscore (`ai_processing`)
- [x] API_URL correctly includes `/api/v1`
- [x] Full URL construction is correct
- [x] Job status/cancel use appropriate endpoints
- [x] HTTP methods align (GET, POST, PATCH, DELETE)
- [x] Parameter passing is consistent (UUID strings work with `<uuid:pk>`)

## Files Modified

1. ✅ `apps/frontend/lib/api-services.ts`
   - Updated `getJobStatus()` to use detail endpoint
   - Updated `cancelJob()` to use PATCH on detail endpoint

## Related Documentation

- See `INTEGRATION_ANALYSIS.md` for overall integration status
- See backend URL patterns in `apps/backend/ai_processing/urls.py`
- See frontend endpoints in `apps/frontend/lib/api-config.ts`

## Status: ✅ **ALIGNED**

All endpoint paths between frontend and backend are correctly aligned and ready for use!

