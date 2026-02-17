"""
Field-Level Encryption for Sensitive Financial Data
Provides encryption/decryption for sensitive data fields in fintech applications.
"""

import base64
import json
import logging
from typing import Any, Dict, List, Optional, Union
from django.db import models
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils.encoding import force_str, force_bytes
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import hashlib
import hmac
import time

logger = logging.getLogger(__name__)


class EncryptionError(Exception):
    """Custom exception for encryption errors"""
    pass


class EncryptionManager:
    """
    Manages encryption/decryption for sensitive data fields.
    Supports multiple encryption keys and key rotation.
    """
    
    def __init__(self):
        self._encryption_keys = {}
        self._current_key_id = None
        self._load_encryption_keys()
    
    def _load_encryption_keys(self):
        """Load encryption keys from settings"""
        encryption_config = getattr(settings, 'ENCRYPTION_CONFIG', {})
        
        if not encryption_config:
            raise ImproperlyConfigured("ENCRYPTION_CONFIG not found in settings")
        
        # Load current encryption key
        current_key = encryption_config.get('current_key')
        if not current_key:
            raise ImproperlyConfigured("Current encryption key not found")
        
        self._current_key_id = current_key
        
        # Load all encryption keys
        keys = encryption_config.get('keys', {})
        for key_id, key_data in keys.items():
            if isinstance(key_data, str):
                # Direct key string
                self._encryption_keys[key_id] = key_data.encode()
            elif isinstance(key_data, dict):
                # Key with metadata
                key_string = key_data.get('key')
                if key_string:
                    self._encryption_keys[key_id] = key_string.encode()
        
        if not self._encryption_keys:
            raise ImproperlyConfigured("No encryption keys found")
    
    def encrypt(self, data: str, key_id: Optional[str] = None) -> str:
        """
        Encrypt data using specified key or current key.
        Returns base64-encoded encrypted data with key ID prefix.
        """
        if not data:
            return data
        
        if key_id is None:
            key_id = self._current_key_id
        
        if key_id not in self._encryption_keys:
            raise EncryptionError(f"Encryption key {key_id} not found")
        
        try:
            # Get encryption key
            key = self._encryption_keys[key_id]
            
            # Create Fernet cipher
            fernet = Fernet(key)
            
            # Encrypt data
            encrypted_data = fernet.encrypt(force_bytes(data))
            
            # Encode with key ID prefix
            encoded_data = base64.b64encode(encrypted_data).decode('utf-8')
            
            # Add key ID prefix for key rotation support
            return f"{key_id}:{encoded_data}"
            
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise EncryptionError(f"Failed to encrypt data: {e}")
    
    def decrypt(self, encrypted_data: str) -> str:
        """
        Decrypt data using the key ID prefix.
        Returns decrypted data as string.
        """
        if not encrypted_data:
            return encrypted_data
        
        try:
            # Check if data has key ID prefix
            if ':' in encrypted_data:
                key_id, encoded_data = encrypted_data.split(':', 1)
            else:
                # Legacy data without key ID prefix
                key_id = self._current_key_id
                encoded_data = encrypted_data
            
            if key_id not in self._encryption_keys:
                raise EncryptionError(f"Decryption key {key_id} not found")
            
            # Get decryption key
            key = self._encryption_keys[key_id]
            
            # Create Fernet cipher
            fernet = Fernet(key)
            
            # Decode and decrypt data
            encrypted_bytes = base64.b64decode(encoded_data)
            decrypted_data = fernet.decrypt(encrypted_bytes)
            
            return force_str(decrypted_data)
            
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise EncryptionError(f"Failed to decrypt data: {e}")
    
    def rotate_key(self, new_key_id: str, new_key: str):
        """Rotate to a new encryption key"""
        if new_key_id not in self._encryption_keys:
            self._encryption_keys[new_key_id] = new_key.encode()
        
        self._current_key_id = new_key_id
        logger.info(f"Encryption key rotated to {new_key_id}")
    
    def get_key_info(self, key_id: str) -> Dict[str, Any]:
        """Get information about an encryption key"""
        if key_id not in self._encryption_keys:
            return {}
        
        return {
            'key_id': key_id,
            'is_current': key_id == self._current_key_id,
            'created_at': getattr(self, f'_key_{key_id}_created_at', None),
        }


# Global encryption manager instance
_encryption_manager = None


def get_encryption_manager() -> EncryptionManager:
    """Get global encryption manager instance"""
    global _encryption_manager
    if _encryption_manager is None:
        _encryption_manager = EncryptionManager()
    return _encryption_manager


class EncryptedField(models.TextField):
    """
    Django model field that automatically encrypts/decrypts data.
    """
    
    def __init__(self, *args, **kwargs):
        self.encryption_key_id = kwargs.pop('encryption_key_id', None)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt value when loading from database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.decrypt(value)
        except EncryptionError:
            logger.warning(f"Failed to decrypt field value: {value[:20]}...")
            return value  # Return encrypted value if decryption fails
    
    def to_python(self, value):
        """Convert value to Python object"""
        if value is None:
            return value
        
        if isinstance(value, str):
            return value
        
        return str(value)
    
    def get_prep_value(self, value):
        """Encrypt value before saving to database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.encrypt(str(value), self.encryption_key_id)
        except EncryptionError:
            logger.warning(f"Failed to encrypt field value: {value[:20]}...")
            return value  # Return unencrypted value if encryption fails
    
    def value_to_string(self, obj):
        """Convert value to string for serialization"""
        value = self.value_from_object(obj)
        return self.get_prep_value(value)


class EncryptedCharField(EncryptedField):
    """Encrypted CharField"""
    pass


class EncryptedEmailField(EncryptedField):
    """Encrypted EmailField"""
    pass


class EncryptedTextField(EncryptedField):
    """Encrypted TextField"""
    pass


class EncryptedJSONField(EncryptedField):
    """Encrypted JSONField"""
    
    def from_db_value(self, value, expression, connection):
        """Decrypt and parse JSON value"""
        decrypted_value = super().from_db_value(value, expression, connection)
        if decrypted_value is None:
            return None
        
        try:
            return json.loads(decrypted_value)
        except (json.JSONDecodeError, TypeError):
            return decrypted_value
    
    def get_prep_value(self, value):
        """Serialize and encrypt JSON value"""
        if value is None:
            return None
        
        try:
            json_value = json.dumps(value)
            return super().get_prep_value(json_value)
        except (TypeError, ValueError):
            return super().get_prep_value(value)


class EncryptedDecimalField(models.DecimalField):
    """Encrypted DecimalField"""
    
    def __init__(self, *args, **kwargs):
        self.encryption_key_id = kwargs.pop('encryption_key_id', None)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt decimal value when loading from database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            decrypted_value = manager.decrypt(str(value))
            return super().from_db_value(decrypted_value, expression, connection)
        except EncryptionError:
            logger.warning(f"Failed to decrypt decimal field value: {value}")
            return value
    
    def get_prep_value(self, value):
        """Encrypt decimal value before saving to database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.encrypt(str(value), self.encryption_key_id)
        except EncryptionError:
            logger.warning(f"Failed to encrypt decimal field value: {value}")
            return value


class EncryptedDateField(models.DateField):
    """Encrypted DateField"""
    
    def __init__(self, *args, **kwargs):
        self.encryption_key_id = kwargs.pop('encryption_key_id', None)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt date value when loading from database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            decrypted_value = manager.decrypt(str(value))
            return super().from_db_value(decrypted_value, expression, connection)
        except EncryptionError:
            logger.warning(f"Failed to decrypt date field value: {value}")
            return value
    
    def get_prep_value(self, value):
        """Encrypt date value before saving to database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.encrypt(str(value), self.encryption_key_id)
        except EncryptionError:
            logger.warning(f"Failed to encrypt date field value: {value}")
            return value


class EncryptedDateTimeField(models.DateTimeField):
    """Encrypted DateTimeField"""
    
    def __init__(self, *args, **kwargs):
        self.encryption_key_id = kwargs.pop('encryption_key_id', None)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt datetime value when loading from database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            decrypted_value = manager.decrypt(str(value))
            return super().from_db_value(decrypted_value, expression, connection)
        except EncryptionError:
            logger.warning(f"Failed to decrypt datetime field value: {value}")
            return value
    
    def get_prep_value(self, value):
        """Encrypt datetime value before saving to database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.encrypt(str(value), self.encryption_key_id)
        except EncryptionError:
            logger.warning(f"Failed to encrypt datetime field value: {value}")
            return value


class EncryptedIntegerField(models.IntegerField):
    """Encrypted IntegerField"""
    
    def __init__(self, *args, **kwargs):
        self.encryption_key_id = kwargs.pop('encryption_key_id', None)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt integer value when loading from database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            decrypted_value = manager.decrypt(str(value))
            return super().from_db_value(decrypted_value, expression, connection)
        except EncryptionError:
            logger.warning(f"Failed to decrypt integer field value: {value}")
            return value
    
    def get_prep_value(self, value):
        """Encrypt integer value before saving to database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.encrypt(str(value), self.encryption_key_id)
        except EncryptionError:
            logger.warning(f"Failed to encrypt integer field value: {value}")
            return value


class EncryptedBigIntegerField(models.BigIntegerField):
    """Encrypted BigIntegerField"""
    
    def __init__(self, *args, **kwargs):
        self.encryption_key_id = kwargs.pop('encryption_key_id', None)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt big integer value when loading from database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            decrypted_value = manager.decrypt(str(value))
            return super().from_db_value(decrypted_value, expression, connection)
        except EncryptionError:
            logger.warning(f"Failed to decrypt big integer field value: {value}")
            return value
    
    def get_prep_value(self, value):
        """Encrypt big integer value before saving to database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.encrypt(str(value), self.encryption_key_id)
        except EncryptionError:
            logger.warning(f"Failed to encrypt big integer field value: {value}")
            return value


class EncryptedBooleanField(models.BooleanField):
    """Encrypted BooleanField"""
    
    def __init__(self, *args, **kwargs):
        self.encryption_key_id = kwargs.pop('encryption_key_id', None)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        """Decrypt boolean value when loading from database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            decrypted_value = manager.decrypt(str(value))
            return super().from_db_value(decrypted_value, expression, connection)
        except EncryptionError:
            logger.warning(f"Failed to decrypt boolean field value: {value}")
            return value
    
    def get_prep_value(self, value):
        """Encrypt boolean value before saving to database"""
        if value is None:
            return value
        
        try:
            manager = get_encryption_manager()
            return manager.encrypt(str(value), self.encryption_key_id)
        except EncryptionError:
            logger.warning(f"Failed to encrypt boolean field value: {value}")
            return value


# Utility functions for encryption
def encrypt_field_value(value: Any, key_id: Optional[str] = None) -> str:
    """Encrypt a field value"""
    if value is None:
        return None
    
    manager = get_encryption_manager()
    return manager.encrypt(str(value), key_id)


def decrypt_field_value(encrypted_value: str) -> str:
    """Decrypt a field value"""
    if encrypted_value is None:
        return None
    
    manager = get_encryption_manager()
    return manager.decrypt(encrypted_value)


def generate_encryption_key() -> str:
    """Generate a new encryption key"""
    return Fernet.generate_key().decode()


def create_encryption_config(keys: Dict[str, str], current_key: str) -> Dict[str, Any]:
    """Create encryption configuration"""
    return {
        'current_key': current_key,
        'keys': keys,
    }


# Model mixins for encryption
class EncryptedModelMixin:
    """Mixin to add encryption capabilities to models"""
    
    def encrypt_field(self, field_name: str, value: Any, key_id: Optional[str] = None):
        """Encrypt a field value"""
        setattr(self, field_name, encrypt_field_value(value, key_id))
    
    def decrypt_field(self, field_name: str) -> str:
        """Decrypt a field value"""
        encrypted_value = getattr(self, field_name, None)
        if encrypted_value is None:
            return None
        
        return decrypt_field_value(encrypted_value)
    
    def get_encrypted_fields(self) -> List[str]:
        """Get list of encrypted fields in the model"""
        encrypted_fields = []
        for field in self._meta.fields:
            if isinstance(field, EncryptedField):
                encrypted_fields.append(field.name)
        return encrypted_fields
    
    def reencrypt_fields(self, new_key_id: str):
        """Re-encrypt all encrypted fields with new key"""
        for field_name in self.get_encrypted_fields():
            current_value = getattr(self, field_name, None)
            if current_value:
                # Decrypt with current key
                decrypted_value = self.decrypt_field(field_name)
                # Encrypt with new key
                self.encrypt_field(field_name, decrypted_value, new_key_id)
