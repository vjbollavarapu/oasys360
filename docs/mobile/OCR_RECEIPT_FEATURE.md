# OCR Receipt Scanning Feature

## Overview
Automated expense entry using OCR (Optical Character Recognition) to extract data from receipt photos.

## Architecture Decision: Backend-Based OCR

### Why Backend Approach?
✅ **Better Accuracy**: Cloud OCR services (Google Vision, AWS Textract) are more accurate than on-device
✅ **Structured Parsing**: Backend can use NLP/AI models to extract structured data (date, amount, merchant, items)
✅ **Receipt-Specific Models**: Can train models specifically for receipt formats
✅ **Scalable**: Processing happens server-side, doesn't drain device battery
✅ **Better for Enterprise**: Centralized processing, audit trails, compliance

### Why Not Pure Flutter?
❌ **Limited Accuracy**: On-device OCR (Tesseract, ML Kit) is less accurate for receipts
❌ **No Structured Parsing**: Would need complex regex/NLP on device
❌ **Battery Drain**: Heavy processing on device
❌ **Model Updates**: Hard to update parsing logic without app updates

## Implementation Flow

```
1. User clicks "Scan Receipt" button
   ↓
2. Camera opens to capture receipt
   ↓
3. Image captured and previewed
   ↓
4. Send image to backend OCR endpoint
   ↓
5. Backend processes with OCR + NLP
   ↓
6. Returns structured data:
   - Merchant name
   - Date
   - Total amount
   - Tax
   - Items (optional)
   - Category (inferred)
   ↓
7. User reviews/edits extracted data
   ↓
8. Save as expense to database
```

## Backend Endpoints Required

### 1. OCR Receipt Processing
```
POST /api/v1/expenses/ocr/scan/
Content-Type: multipart/form-data
Body: { image: File }

Response:
{
  "merchant": "Restaurant Name",
  "date": "2024-12-24",
  "total": 45.99,
  "tax": 4.14,
  "subtotal": 41.85,
  "items": [
    {"description": "Burger", "quantity": 2, "price": 15.99},
    {"description": "Fries", "quantity": 1, "price": 4.99}
  ],
  "category": "Food & Beverage",
  "confidence": 0.95
}
```

### 2. Save Expense
```
POST /api/v1/accounting/journal-entries/
or
POST /api/v1/expenses/
Body: {
  "merchant": "Restaurant Name",
  "amount": 45.99,
  "date": "2024-12-24",
  "category": "Food & Beverage",
  "receipt_image": <file>,
  "description": "Lunch at restaurant"
}
```

## Flutter Implementation

### Required Packages
- `image_picker` - Camera/gallery access
- `camera` - Camera preview
- `dio` - HTTP client with multipart upload
- `image` - Image processing if needed

### Screens
1. **Receipt Scanner Screen** - Camera capture + preview
2. **Receipt Review Screen** - Edit extracted data + save

## Backend Implementation Notes

### Recommended OCR Services:
1. **Google Cloud Vision API** - Best for general OCR
2. **AWS Textract** - Good for structured documents
3. **Azure Computer Vision** - Alternative option
4. **Specialized Receipt APIs**: 
   - Veryfi Receipt API
   - Tabscanner
   - Receipt OCR API

### Backend Processing Steps:
1. Receive image
2. Send to OCR service (Google Vision API recommended)
3. Extract text blocks
4. Use NLP/Regex to parse:
   - Merchant name (usually top line or after logo)
   - Date (various formats: MM/DD/YYYY, DD-MM-YYYY)
   - Amount (look for "TOTAL", "AMOUNT DUE", etc.)
   - Items (line items before total)
5. Infer category based on merchant/keywords
6. Return structured JSON

### Example Python Backend Code (Django):
```python
# views.py
from google.cloud import vision
import re
from datetime import datetime

def ocr_scan_receipt(request):
    image = request.FILES['image']
    
    # Initialize Google Vision client
    client = vision.ImageAnnotatorClient()
    content = image.read()
    image_obj = vision.Image(content=content)
    
    # Perform OCR
    response = client.document_text_detection(image=image_obj)
    text = response.full_text_annotation.text
    
    # Parse receipt data
    parsed_data = parse_receipt_text(text)
    
    return JsonResponse(parsed_data)

def parse_receipt_text(text):
    # Extract merchant (usually first line)
    lines = text.split('\n')
    merchant = lines[0] if lines else "Unknown Merchant"
    
    # Extract date (look for date patterns)
    date = extract_date(text)
    
    # Extract total (look for "TOTAL", "AMOUNT", etc.)
    total = extract_amount(text)
    
    # Extract items
    items = extract_items(text)
    
    return {
        "merchant": merchant,
        "date": date,
        "total": total,
        "items": items
    }
```

## Current Implementation Status

✅ Flutter frontend ready
⏳ Backend OCR endpoint needs to be implemented
✅ Image capture and upload ready
✅ Review/edit UI ready
✅ Save expense flow ready

