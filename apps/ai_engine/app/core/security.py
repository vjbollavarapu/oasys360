"""
Security utilities for API authentication
"""
from fastapi import HTTPException, Security, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.config import settings

security = HTTPBearer()


async def verify_api_key(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> str:
    """
    Verify API key from header
    Can accept either Authorization Bearer token or X-API-Key header
    """
    if not settings.API_KEY:
        # If no API key is configured, skip validation (development only)
        return "default"
    
    api_key = None
    
    # Check X-API-Key header
    if x_api_key:
        api_key = x_api_key
    # Check Authorization header
    elif authorization and authorization.startswith("Bearer "):
        api_key = authorization.replace("Bearer ", "")
    
    if not api_key or api_key != settings.API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key"
        )
    
    return api_key


async def verify_django_request(
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID"),
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Verify request from Django backend
    Returns tenant context
    """
    tenant_id = x_tenant_id
    
    return {
        "tenant_id": tenant_id,
        "authorized": True
    }

