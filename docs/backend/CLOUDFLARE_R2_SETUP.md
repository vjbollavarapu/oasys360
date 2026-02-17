# Cloudflare R2 Integration Guide

This guide explains how to set up and use Cloudflare R2 for file storage in OASYS360.

## Overview

Cloudflare R2 is an S3-compatible object storage service that provides:
- **No egress fees** (unlike AWS S3)
- **S3-compatible API** (works with boto3)
- **Global CDN** integration
- **Direct uploads** from Flutter/mobile apps via signed URLs

## Setup Instructions

### 1. Create Cloudflare R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** > **Create bucket**
3. Enter a bucket name (e.g., `oasys360-files`)
4. Choose a location (closest to your users)

### 2. Create API Token

1. Go to **R2** > **Manage R2 API Tokens**
2. Click **Create API Token**
3. Select permissions:
   - **Object Read & Write** (for full access)
   - Or **Object Read** + **Object Write** separately
4. Copy the **Access Key ID** and **Secret Access Key**
5. Note your **Account ID** (found in the R2 dashboard URL or sidebar)

### 3. Configure Environment Variables

Add these to your `apps/backend/.env` file:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=oasys360-files

# Optional: Custom domain for public access
# Set up a custom domain in Cloudflare R2 > Settings > Public Access
CLOUDFLARE_R2_PUBLIC_URL=https://files.yourdomain.com

# Direct upload settings
CLOUDFLARE_R2_ENABLE_DIRECT_UPLOAD=True
CLOUDFLARE_R2_SIGNED_URL_EXPIRY=3600  # 1 hour
```

### 4. (Optional) Set Up Custom Domain

For public file access via a custom domain:

1. In R2 bucket settings, go to **Public Access**
2. Add a custom domain (e.g., `files.yourdomain.com`)
3. Update your DNS to point the domain to Cloudflare
4. Set `CLOUDFLARE_R2_PUBLIC_URL` in your `.env`

## Usage

### Backend (Django)

The system automatically uses Cloudflare R2 if configured. Files uploaded via Django's `FileField` or `ImageField` will be stored in R2.

```python
from django.db import models

class Document(models.Model):
    file = models.FileField(upload_to='documents/')
    # File will be automatically uploaded to R2
```

### Direct Upload from Flutter/Mobile

For direct uploads from Flutter apps (bypassing the backend):

#### 1. Request Upload URL

```dart
// Request signed upload URL from backend
final response = await http.post(
  Uri.parse('$apiBaseUrl/api/v1/documents/upload/generate-url/'),
  headers: {
    'Authorization': 'Bearer $accessToken',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'filename': 'receipt.jpg',
    'content_type': 'image/jpeg',
    'expiration': 3600,  // Optional: URL expiry in seconds
  }),
);

final data = jsonDecode(response.body);
final uploadUrl = data['upload_url'];
final objectKey = data['object_key'];
```

#### 2. Upload File Directly to R2

```dart
// Upload file directly to Cloudflare R2
final file = File('/path/to/receipt.jpg');
final fileBytes = await file.readAsBytes();

final uploadResponse = await http.put(
  Uri.parse(uploadUrl),
  headers: {
    'Content-Type': 'image/jpeg',
  },
  body: fileBytes,
);

if (uploadResponse.statusCode == 200) {
  // File uploaded successfully!
  // Save object_key to your database
  print('File uploaded: $objectKey');
}
```

#### 3. Save File Reference to Backend

```dart
// Save file metadata to backend
await http.post(
  Uri.parse('$apiBaseUrl/api/v1/documents/'),
  headers: {
    'Authorization': 'Bearer $accessToken',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'filename': 'receipt.jpg',
    'file_path': objectKey,  // R2 object key
    'file_size': fileBytes.length,
    'mime_type': 'image/jpeg',
  }),
);
```

## API Endpoints

### Generate Upload URL

**POST** `/api/v1/documents/upload/generate-url/`

Request body:
```json
{
  "filename": "receipt.jpg",
  "content_type": "image/jpeg",
  "expiration": 3600
}
```

Response:
```json
{
  "success": true,
  "upload_url": "https://...",
  "method": "PUT",
  "headers": {
    "Content-Type": "image/jpeg"
  },
  "object_key": "tenant-id/documents/20250127_123456_abc123_receipt.jpg",
  "expires_at": "2025-01-27T13:36:00Z",
  "public_url": "https://files.yourdomain.com/tenant-id/documents/..."
}
```

## Storage Structure

Files are organized by tenant in R2:

```
bucket-name/
  ├── {tenant-id}/
  │   ├── documents/
  │   │   ├── 20250127_123456_abc123_receipt.jpg
  │   │   └── 20250127_123500_def456_invoice.pdf
  │   ├── images/
  │   └── uploads/
```

## Benefits of Direct Upload

1. **Reduced Backend Load**: Files go directly to R2, not through Django
2. **Faster Uploads**: No intermediate server processing
3. **Better Mobile Experience**: Direct uploads are more efficient for mobile apps
4. **Scalability**: R2 handles the upload, not your backend

## Security

- All upload URLs are **signed** and expire after the specified time
- Files are stored **privately** by default
- Access requires authentication via the backend API
- Public URLs only work if `CLOUDFLARE_R2_PUBLIC_URL` is configured

## Troubleshooting

### "Cloudflare R2 not configured" error

- Check that all required environment variables are set
- Verify your API token has the correct permissions
- Ensure the bucket name is correct

### Upload fails with 403 Forbidden

- Check that the signed URL hasn't expired
- Verify the Content-Type header matches what was requested
- Ensure the API token has write permissions

### Files not accessible

- If using public URLs, ensure custom domain is configured
- For private files, use the backend API to generate signed download URLs
- Check bucket permissions in Cloudflare dashboard

## Migration from S3

If you're migrating from AWS S3:

1. Set up Cloudflare R2 bucket
2. Update environment variables (remove AWS vars, add R2 vars)
3. Files will automatically use R2 going forward
4. Old S3 files remain in S3 (consider migrating them separately)

## Cost Comparison

- **Cloudflare R2**: No egress fees, pay only for storage
- **AWS S3**: Storage + egress fees (can be expensive for high traffic)

For applications with significant file downloads, R2 can save substantial costs.

