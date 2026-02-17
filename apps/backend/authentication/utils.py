"""
Authentication utilities for user type detection and corporate email validation
"""
import re
from typing import Dict, Optional, Tuple
from django.core.exceptions import ValidationError

# Common corporate email domains (can be extended)
CORPORATE_EMAIL_DOMAINS = {
    # Major corporate providers
    'outlook.com', 'office365.com', 'microsoft.com',
    'gmail.com', 'googlemail.com',  # Google Workspace uses custom domains
    'yahoo.com', 'ymail.com',
    'aol.com',
    'icloud.com', 'me.com', 'mac.com',
    'protonmail.com', 'proton.me',
    'zoho.com',
    'mail.com',
}

# Free email providers (typically not corporate)
FREE_EMAIL_DOMAINS = {
    'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com',
    'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
    'aol.com', 'icloud.com', 'me.com', 'mac.com',
    'protonmail.com', 'proton.me', 'zoho.com', 'mail.com',
    'yandex.com', 'mail.ru', 'gmx.com', 'tutanota.com',
}

# Known corporate email patterns
CORPORATE_EMAIL_PATTERNS = [
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',  # Standard email
]


def is_corporate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Check if an email is a corporate email
    
    Args:
        email: Email address to check
    
    Returns:
        Tuple of (is_corporate, reason)
        - is_corporate: True if corporate, False if personal/free
        - reason: Explanation of the determination
    """
    if not email:
        return False, "Email is required"
    
    email = email.lower().strip()
    
    # Extract domain
    try:
        local, domain = email.split('@', 1)
    except ValueError:
        return False, "Invalid email format"
    
    # Check if it's a known free email provider
    if domain in FREE_EMAIL_DOMAINS:
        return False, f"{domain} is typically a personal email provider"
    
    # Check if it's a known corporate provider (but allow custom domains)
    if domain in CORPORATE_EMAIL_DOMAINS:
        # These could be corporate if using Google Workspace, Microsoft 365, etc.
        # We'll treat them as potentially corporate but require verification
        return True, f"{domain} may be corporate (requires verification)"
    
    # Custom domains are likely corporate
    # Check if it's a valid domain format
    domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$'
    if re.match(domain_pattern, domain):
        # Custom domain - likely corporate
        return True, f"{domain} appears to be a corporate domain"
    
    return False, "Unable to determine email type"


def validate_corporate_email(email: str, strict: bool = True) -> Tuple[bool, Optional[str]]:
    """
    Validate if email is corporate (strict mode for business accounts)
    
    Args:
        email: Email address to validate
        strict: If True, reject free email providers
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    is_corporate, reason = is_corporate_email(email)
    
    if strict and not is_corporate:
        return False, f"Corporate email required. {reason}"
    
    return True, None


def detect_user_type(user, tenant=None) -> Dict:
    """
    Detect user type and account status
    
    Args:
        user: User instance
        tenant: Tenant instance (optional)
    
    Returns:
        Dictionary with user type information
    """
    account_type = getattr(user, 'account_type', 'corporate')
    is_verified = getattr(user, 'email_verified', False)
    is_corporate, _ = is_corporate_email(user.email)
    
    # Determine account tier
    if account_type == 'trial' or (not is_verified and not is_corporate):
        tier = 'trial'
        access_level = 'limited'
    elif account_type == 'corporate' and is_verified:
        tier = 'business'
        access_level = 'full'
    else:
        tier = 'pending_verification'
        access_level = 'limited'
    
    return {
        'account_type': account_type,
        'tier': tier,
        'access_level': access_level,
        'email_verified': is_verified,
        'is_corporate_email': is_corporate,
        'requires_verification': not is_verified and account_type == 'corporate',
        'can_access_financial_features': tier == 'business',
        'can_invite_team': tier == 'business',
        'can_create_invoices': tier == 'business',
        'can_access_banking': tier == 'business',
    }


def assign_user_to_group(user, tenant=None):
    """
    Assign user to appropriate group based on role and account type
    (Legacy function - kept for compatibility)
    """
    # This can be extended to assign Django groups if needed
    pass
