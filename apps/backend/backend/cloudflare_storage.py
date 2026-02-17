"""
Cloudflare R2 Storage Utility
Provides S3-compatible storage using Cloudflare R2
Supports direct uploads from Flutter/mobile apps via signed URLs
"""

import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.utils.deconstruct import deconstructible
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class CloudflareR2Storage:
    """
    Cloudflare R2 Storage client using boto3 (S3-compatible API)
    """
    
    def __init__(self):
        self.account_id = os.getenv('CLOUDFLARE_R2_ACCOUNT_ID')
        self.access_key_id = os.getenv('CLOUDFLARE_R2_ACCESS_KEY_ID')
        self.secret_access_key = os.getenv('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
        self.bucket_name = os.getenv('CLOUDFLARE_R2_BUCKET_NAME')
        self.public_url = os.getenv('CLOUDFLARE_R2_PUBLIC_URL', '')
        
        # Construct endpoint URL
        if self.account_id:
            self.endpoint_url = f"https://{self.account_id}.r2.cloudflarestorage.com"
        else:
            self.endpoint_url = os.getenv('CLOUDFLARE_R2_ENDPOINT_URL', '')
        
        # Initialize S3 client with R2 endpoint
        if all([self.access_key_id, self.secret_access_key, self.bucket_name, self.endpoint_url]):
            self.s3_client = boto3.client(
                's3',
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
                config=Config(
                    signature_version='s3v4',
                    s3={
                        'addressing_style': 'path'
                    }
                )
            )
            self.is_configured = True
        else:
            self.s3_client = None
            self.is_configured = False
            logger.warning("Cloudflare R2 not fully configured. Missing required environment variables.")
    
    def upload_file(self, file_obj, object_name, content_type=None, metadata=None):
        """
        Upload a file to Cloudflare R2
        
        Args:
            file_obj: File-like object or file path
            object_name: S3 object key (path in bucket)
            content_type: MIME type of the file
            metadata: Optional metadata dict
        
        Returns:
            dict with 'url' and 'key' if successful, None otherwise
        """
        if not self.is_configured:
            logger.error("Cloudflare R2 not configured. Cannot upload file.")
            return None
        
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            if metadata:
                extra_args['Metadata'] = {str(k): str(v) for k, v in metadata.items()}
            
            # Upload file
            if hasattr(file_obj, 'read'):
                # File-like object
                self.s3_client.upload_fileobj(
                    file_obj,
                    self.bucket_name,
                    object_name,
                    ExtraArgs=extra_args
                )
            else:
                # File path
                self.s3_client.upload_file(
                    file_obj,
                    self.bucket_name,
                    object_name,
                    ExtraArgs=extra_args
                )
            
            # Construct URL
            if self.public_url:
                url = f"{self.public_url.rstrip('/')}/{object_name}"
            else:
                url = f"{self.endpoint_url}/{self.bucket_name}/{object_name}"
            
            logger.info(f"Successfully uploaded {object_name} to Cloudflare R2")
            return {
                'url': url,
                'key': object_name,
                'bucket': self.bucket_name
            }
        except ClientError as e:
            logger.error(f"Error uploading to Cloudflare R2: {str(e)}")
            return None
    
    def delete_file(self, object_name):
        """
        Delete a file from Cloudflare R2
        
        Args:
            object_name: S3 object key (path in bucket)
        
        Returns:
            True if successful, False otherwise
        """
        if not self.is_configured:
            logger.error("Cloudflare R2 not configured. Cannot delete file.")
            return False
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            logger.info(f"Successfully deleted {object_name} from Cloudflare R2")
            return True
        except ClientError as e:
            logger.error(f"Error deleting from Cloudflare R2: {str(e)}")
            return False
    
    def generate_presigned_url(self, object_name, expiration=3600, method='GET'):
        """
        Generate a presigned URL for direct upload/download
        
        Args:
            object_name: S3 object key (path in bucket)
            expiration: URL expiration time in seconds (default: 1 hour)
            method: HTTP method ('GET' for download, 'PUT' for upload)
        
        Returns:
            Presigned URL string or None if error
        """
        if not self.is_configured:
            logger.error("Cloudflare R2 not configured. Cannot generate presigned URL.")
            return None
        
        try:
            if method == 'PUT':
                # For uploads (PUT)
                url = self.s3_client.generate_presigned_url(
                    'put_object',
                    Params={
                        'Bucket': self.bucket_name,
                        'Key': object_name
                    },
                    ExpiresIn=expiration
                )
            else:
                # For downloads (GET)
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': self.bucket_name,
                        'Key': object_name
                    },
                    ExpiresIn=expiration
                )
            
            logger.info(f"Generated presigned URL for {object_name} (method: {method}, expires in {expiration}s)")
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            return None
    
    def generate_upload_url(self, object_name, content_type=None, expiration=3600):
        """
        Generate a presigned URL for direct file upload (for Flutter/mobile apps)
        
        Args:
            object_name: S3 object key (path in bucket)
            content_type: Optional MIME type to enforce
            expiration: URL expiration time in seconds (default: 1 hour)
        
        Returns:
            dict with 'upload_url', 'method', 'headers', and 'expires_at'
        """
        if not self.is_configured:
            logger.error("Cloudflare R2 not configured. Cannot generate upload URL.")
            return None
        
        try:
            params = {
                'Bucket': self.bucket_name,
                'Key': object_name
            }
            
            if content_type:
                params['ContentType'] = content_type
            
            url = self.s3_client.generate_presigned_url(
                'put_object',
                Params=params,
                ExpiresIn=expiration
            )
            
            expires_at = datetime.utcnow() + timedelta(seconds=expiration)
            
            result = {
                'upload_url': url,
                'method': 'PUT',
                'headers': {}
            }
            
            if content_type:
                result['headers']['Content-Type'] = content_type
            
            result['expires_at'] = expires_at.isoformat()
            result['object_key'] = object_name
            
            logger.info(f"Generated upload URL for {object_name} (expires at {expires_at})")
            return result
        except ClientError as e:
            logger.error(f"Error generating upload URL: {str(e)}")
            return None
    
    def file_exists(self, object_name):
        """
        Check if a file exists in Cloudflare R2
        
        Args:
            object_name: S3 object key (path in bucket)
        
        Returns:
            True if file exists, False otherwise
        """
        if not self.is_configured:
            return False
        
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            logger.error(f"Error checking file existence: {str(e)}")
            return False
    
    def get_file_url(self, object_name, signed=False, expiration=3600):
        """
        Get file URL (public or signed)
        
        Args:
            object_name: S3 object key (path in bucket)
            signed: Whether to generate a signed URL
            expiration: Expiration time for signed URLs
        
        Returns:
            URL string
        """
        if not self.is_configured:
            return None
        
        if signed:
            return self.generate_presigned_url(object_name, expiration=expiration)
        
        if self.public_url:
            return f"{self.public_url.rstrip('/')}/{object_name}"
        else:
            return f"{self.endpoint_url}/{self.bucket_name}/{object_name}"


# Global instance
_cloudflare_r2 = None

def get_cloudflare_r2():
    """Get or create Cloudflare R2 storage instance"""
    global _cloudflare_r2
    if _cloudflare_r2 is None:
        _cloudflare_r2 = CloudflareR2Storage()
    return _cloudflare_r2


@deconstructible
class CloudflareR2FileStorage(Storage):
    """
    Django storage backend for Cloudflare R2
    Compatible with Django's FileField and ImageField
    """
    
    def __init__(self):
        self.r2 = get_cloudflare_r2()
    
    def _open(self, name, mode='rb'):
        """Open file for reading"""
        from django.core.files.base import ContentFile
        try:
            # Get file from R2
            response = self.r2.s3_client.get_object(
                Bucket=self.r2.bucket_name,
                Key=name
            )
            return ContentFile(response['Body'].read())
        except ClientError as e:
            logger.error(f"Error opening file from R2: {str(e)}")
            raise FileNotFoundError(f"File {name} not found in R2")
    
    def _save(self, name, content):
        """Save file to R2"""
        try:
            # Get content type
            content_type = getattr(content, 'content_type', None)
            if not content_type:
                import mimetypes
                content_type, _ = mimetypes.guess_type(name)
            
            # Upload to R2
            result = self.r2.upload_file(
                content,
                name,
                content_type=content_type
            )
            
            if result:
                return name
            else:
                raise Exception("Failed to upload file to R2")
        except Exception as e:
            logger.error(f"Error saving file to R2: {str(e)}")
            raise
    
    def delete(self, name):
        """Delete file from R2"""
        return self.r2.delete_file(name)
    
    def exists(self, name):
        """Check if file exists in R2"""
        return self.r2.file_exists(name)
    
    def url(self, name):
        """Get file URL"""
        # Return signed URL for private files
        return self.r2.get_file_url(name, signed=True)
    
    def size(self, name):
        """Get file size"""
        try:
            response = self.r2.s3_client.head_object(
                Bucket=self.r2.bucket_name,
                Key=name
            )
            return response['ContentLength']
        except ClientError:
            return 0

