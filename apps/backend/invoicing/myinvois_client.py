"""
MyInvois API Client for LHDN e-Invoicing
Handles authentication, submission, and status tracking with MyInvois portal
"""

import requests
import logging
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.utils import timezone
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class MyInvoisClient:
    """
    Client for interacting with LHDN MyInvois API
    Supports both sandbox and production environments
    """
    
    # API Endpoints
    SANDBOX_BASE_URL = "https://myinvois.hasil.gov.my/api"
    PRODUCTION_BASE_URL = "https://myinvois.hasil.gov.my/api"
    
    def __init__(
        self,
        api_key: str,
        api_secret: str,
        environment: str = 'sandbox',
        tenant_id: Optional[str] = None
    ):
        """
        Initialize MyInvois API client
        
        Args:
            api_key: MyInvois API key
            api_secret: MyInvois API secret
            environment: 'sandbox' or 'production'
            tenant_id: Tenant ID for multi-tenant support
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.environment = environment
        self.tenant_id = tenant_id
        self.base_url = self.SANDBOX_BASE_URL if environment == 'sandbox' else self.PRODUCTION_BASE_URL
        self.access_token = None
        self.token_expiry = None
        
    def _get_access_token(self) -> str:
        """
        Get OAuth2 access token from MyInvois
        Implements client credentials flow
        """
        if self.access_token and self.token_expiry and timezone.now() < self.token_expiry:
            return self.access_token
        
        token_url = f"{self.base_url}/auth/token"
        
        payload = {
            'grant_type': 'client_credentials',
            'client_id': self.api_key,
            'client_secret': self.api_secret,
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        
        try:
            response = requests.post(token_url, data=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in', 3600)  # Default 1 hour
            
            # Set expiry time with 5 minute buffer
            from datetime import timedelta
            self.token_expiry = timezone.now() + timedelta(seconds=expires_in - 300)
            
            logger.info(f"MyInvois access token obtained successfully for tenant {self.tenant_id}")
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to obtain MyInvois access token: {e}")
            raise Exception(f"Authentication failed: {str(e)}")
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Make authenticated request to MyInvois API
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path
            data: Request payload
            headers: Additional headers
            
        Returns:
            Response data as dictionary
        """
        token = self._get_access_token()
        
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        request_headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        if headers:
            request_headers.update(headers)
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            
            # Handle empty responses
            if response.status_code == 204 or not response.content:
                return {}
            
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            error_message = f"HTTP {e.response.status_code}: {e.response.text}"
            logger.error(f"MyInvois API error: {error_message}")
            
            try:
                error_data = e.response.json()
                raise Exception(f"MyInvois API error: {error_data}")
            except:
                raise Exception(f"MyInvois API error: {error_message}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"MyInvois API request failed: {e}")
            raise Exception(f"Request failed: {str(e)}")
    
    def submit_invoice(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit invoice to MyInvois for validation
        
        Args:
            invoice_data: UBL 2.1 formatted invoice data (JSON or dict)
            
        Returns:
            Response containing QRID and validation status
        """
        endpoint = "/v1/invoices"
        
        try:
            response = self._make_request('POST', endpoint, data=invoice_data)
            
            # Extract QRID and status from response
            result = {
                'success': True,
                'qrid': response.get('qrid'),  # LHDN Reference Number
                'status': response.get('status', 'submitted'),
                'validation_status': response.get('validation_status'),
                'timestamp': response.get('timestamp'),
                'errors': response.get('errors', []),
                'warnings': response.get('warnings', []),
                'raw_response': response,
            }
            
            logger.info(f"Invoice submitted successfully. QRID: {result.get('qrid')}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to submit invoice to MyInvois: {e}")
            return {
                'success': False,
                'error': str(e),
                'errors': [str(e)],
            }
    
    def get_invoice_status(self, qrid: str) -> Dict[str, Any]:
        """
        Get invoice status from MyInvois
        
        Args:
            qrid: LHDN Reference Number (QRID)
            
        Returns:
            Invoice status information
        """
        endpoint = f"/v1/invoices/{qrid}/status"
        
        try:
            response = self._make_request('GET', endpoint)
            
            return {
                'success': True,
                'qrid': qrid,
                'status': response.get('status'),
                'validation_status': response.get('validation_status'),
                'updated_at': response.get('updated_at'),
                'errors': response.get('errors', []),
                'raw_response': response,
            }
            
        except Exception as e:
            logger.error(f"Failed to get invoice status from MyInvois: {e}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def cancel_invoice(self, qrid: str, cancellation_reason: str) -> Dict[str, Any]:
        """
        Cancel an invoice in MyInvois
        
        Args:
            qrid: LHDN Reference Number (QRID)
            cancellation_reason: Reason for cancellation (mandatory)
            
        Returns:
            Cancellation status
        """
        endpoint = f"/v1/invoices/{qrid}/cancel"
        
        data = {
            'cancellation_reason': cancellation_reason,
        }
        
        try:
            response = self._make_request('POST', endpoint, data=data)
            
            return {
                'success': True,
                'qrid': qrid,
                'status': response.get('status'),
                'cancelled_at': response.get('cancelled_at'),
                'raw_response': response,
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel invoice in MyInvois: {e}")
            return {
                'success': False,
                'error': str(e),
            }
    
    def health_check(self) -> bool:
        """
        Check if MyInvois API is accessible
        
        Returns:
            True if API is accessible, False otherwise
        """
        try:
            endpoint = "/v1/health"
            response = self._make_request('GET', endpoint)
            return response.get('status') == 'ok'
        except:
            return False

