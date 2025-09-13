# backend/encryption.py
import base64
import hashlib
import secrets
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class DataEncryption:
    """Data encryption utility for sensitive information"""
    
    def __init__(self):
        self.key = self._get_or_create_key()
        self.cipher = Fernet(self.key)
    
    def _get_or_create_key(self):
        """Get or create encryption key"""
        # In production, store this key securely (e.g., AWS KMS, Azure Key Vault)
        key_string = getattr(settings, 'ENCRYPTION_KEY', None)
        
        if not key_string:
            # Generate a new key (for development only)
            key_string = Fernet.generate_key()
            logger.warning("No encryption key found. Generated new key for development.")
        
        if isinstance(key_string, str):
            key_string = key_string.encode()
        
        return key_string
    
    def encrypt(self, data: str) -> str:
        """Encrypt string data"""
        try:
            if not isinstance(data, str):
                data = str(data)
            
            encrypted_data = self.cipher.encrypt(data.encode())
            return base64.b64encode(encrypted_data).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt string data"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_data.encode())
            decrypted_data = self.cipher.decrypt(encrypted_bytes)
            return decrypted_data.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise
    
    def encrypt_dict(self, data: dict) -> dict:
        """Encrypt all string values in a dictionary"""
        encrypted_dict = {}
        for key, value in data.items():
            if isinstance(value, str):
                encrypted_dict[key] = self.encrypt(value)
            elif isinstance(value, dict):
                encrypted_dict[key] = self.encrypt_dict(value)
            else:
                encrypted_dict[key] = value
        return encrypted_dict
    
    def decrypt_dict(self, encrypted_data: dict) -> dict:
        """Decrypt all string values in a dictionary"""
        decrypted_dict = {}
        for key, value in encrypted_data.items():
            if isinstance(value, str):
                try:
                    decrypted_dict[key] = self.decrypt(value)
                except:
                    # If decryption fails, assume it's not encrypted
                    decrypted_dict[key] = value
            elif isinstance(value, dict):
                decrypted_dict[key] = self.decrypt_dict(value)
            else:
                decrypted_dict[key] = value
        return decrypted_dict

class PasswordHashing:
    """Secure password hashing utilities"""
    
    @staticmethod
    def hash_password(password: str, salt: str = None) -> tuple:
        """Hash password with salt"""
        if salt is None:
            salt = secrets.token_hex(32)
        
        # Use PBKDF2 with SHA-256
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt.encode(),
            iterations=100000,
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key.decode(), salt
    
    @staticmethod
    def verify_password(password: str, hashed_password: str, salt: str) -> bool:
        """Verify password against hash"""
        try:
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt.encode(),
                iterations=100000,
            )
            
            key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
            return key.decode() == hashed_password
        except Exception as e:
            logger.error(f"Password verification failed: {e}")
            return False

class TokenGeneration:
    """Secure token generation utilities"""
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate a cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a secure API key"""
        return f"oasys_{secrets.token_urlsafe(32)}"
    
    @staticmethod
    def generate_session_token() -> str:
        """Generate a secure session token"""
        return secrets.token_urlsafe(48)
    
    @staticmethod
    def generate_verification_code(length: int = 6) -> str:
        """Generate a numeric verification code"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(length)])

class DataMasking:
    """Data masking utilities for sensitive information"""
    
    @staticmethod
    def mask_email(email: str) -> str:
        """Mask email address"""
        if '@' not in email:
            return email
        
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            masked_local = '*' * len(local)
        else:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
        
        return f"{masked_local}@{domain}"
    
    @staticmethod
    def mask_phone(phone: str) -> str:
        """Mask phone number"""
        if len(phone) <= 4:
            return '*' * len(phone)
        
        return phone[:2] + '*' * (len(phone) - 4) + phone[-2:]
    
    @staticmethod
    def mask_credit_card(card_number: str) -> str:
        """Mask credit card number"""
        if len(card_number) <= 4:
            return '*' * len(card_number)
        
        return '*' * (len(card_number) - 4) + card_number[-4:]
    
    @staticmethod
    def mask_ssn(ssn: str) -> str:
        """Mask Social Security Number"""
        if len(ssn) != 9:
            return '*' * len(ssn)
        
        return '***-**-' + ssn[-4:]

class SecureStorage:
    """Secure storage utilities"""
    
    def __init__(self):
        self.encryption = DataEncryption()
    
    def store_sensitive_data(self, data: dict, key_prefix: str = "") -> dict:
        """Store sensitive data with encryption"""
        encrypted_data = self.encryption.encrypt_dict(data)
        
        # Add metadata
        storage_data = {
            'encrypted': True,
            'key_prefix': key_prefix,
            'data': encrypted_data,
            'timestamp': self._get_timestamp(),
        }
        
        return storage_data
    
    def retrieve_sensitive_data(self, storage_data: dict) -> dict:
        """Retrieve and decrypt sensitive data"""
        if not storage_data.get('encrypted', False):
            return storage_data.get('data', {})
        
        encrypted_data = storage_data.get('data', {})
        return self.encryption.decrypt_dict(encrypted_data)
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.utcnow().isoformat()

# Global instances
data_encryption = DataEncryption()
password_hashing = PasswordHashing()
token_generation = TokenGeneration()
data_masking = DataMasking()
secure_storage = SecureStorage()

# Utility functions for easy access
def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive data"""
    return data_encryption.encrypt(data)

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    return data_encryption.decrypt(encrypted_data)

def hash_user_password(password: str) -> tuple:
    """Hash user password"""
    return password_hashing.hash_password(password)

def verify_user_password(password: str, hashed_password: str, salt: str) -> bool:
    """Verify user password"""
    return password_hashing.verify_password(password, hashed_password, salt)

def generate_secure_token(length: int = 32) -> str:
    """Generate secure token"""
    return token_generation.generate_secure_token(length)

def mask_pii_data(data: str, data_type: str) -> str:
    """Mask personally identifiable information"""
    if data_type == 'email':
        return data_masking.mask_email(data)
    elif data_type == 'phone':
        return data_masking.mask_phone(data)
    elif data_type == 'credit_card':
        return data_masking.mask_credit_card(data)
    elif data_type == 'ssn':
        return data_masking.mask_ssn(data)
    else:
        return data
