# backend/redis_config.py
import redis
from django.conf import settings
import json
import pickle
from typing import Any, Optional, Union
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    def __init__(self):
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.Redis(
                host=getattr(settings, 'REDIS_HOST', 'localhost'),
                port=getattr(settings, 'REDIS_PORT', 6379),
                db=getattr(settings, 'REDIS_DB', 0),
                password=getattr(settings, 'REDIS_PASSWORD', None),
                decode_responses=False,  # We'll handle encoding/decoding manually
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Redis connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_connected():
            return None
        
        try:
            value = self.redis_client.get(key)
            if value is None:
                return None
            
            # Try to deserialize as JSON first, then pickle
            try:
                return json.loads(value.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                return pickle.loads(value)
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, timeout: int = 300) -> bool:
        """Set value in cache with timeout"""
        if not self.is_connected():
            return False
        
        try:
            # Try to serialize as JSON first, fallback to pickle
            try:
                serialized_value = json.dumps(value, default=str)
            except (TypeError, ValueError):
                serialized_value = pickle.dumps(value)
            
            return self.redis_client.setex(key, timeout, serialized_value)
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.is_connected():
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Error deleting cache pattern {pattern}: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    def expire(self, key: str, timeout: int) -> bool:
        """Set expiration for key"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.redis_client.expire(key, timeout))
        except Exception as e:
            logger.error(f"Error setting expiration for key {key}: {e}")
            return False
    
    def get_ttl(self, key: str) -> int:
        """Get time to live for key"""
        if not self.is_connected():
            return -1
        
        try:
            return self.redis_client.ttl(key)
        except Exception as e:
            logger.error(f"Error getting TTL for key {key}: {e}")
            return -1
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment counter"""
        if not self.is_connected():
            return None
        
        try:
            return self.redis_client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Error incrementing key {key}: {e}")
            return None
    
    def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """Decrement counter"""
        if not self.is_connected():
            return None
        
        try:
            return self.redis_client.decrby(key, amount)
        except Exception as e:
            logger.error(f"Error decrementing key {key}: {e}")
            return None

# Global Redis instance
redis_cache = RedisCache()

# Cache decorators
def cache_result(timeout: int = 300, key_prefix: str = ""):
    """Decorator to cache function results"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            redis_cache.set(cache_key, result, timeout)
            return result
        
        return wrapper
    return decorator

def cache_invalidate(pattern: str):
    """Decorator to invalidate cache on function call"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            redis_cache.delete_pattern(pattern)
            return result
        
        return wrapper
    return decorator

# Cache key generators
def get_user_cache_key(user_id: int, suffix: str = "") -> str:
    """Generate cache key for user-specific data"""
    return f"user:{user_id}:{suffix}" if suffix else f"user:{user_id}"

def get_tenant_cache_key(tenant_id: int, suffix: str = "") -> str:
    """Generate cache key for tenant-specific data"""
    return f"tenant:{tenant_id}:{suffix}" if suffix else f"tenant:{tenant_id}"

def get_api_cache_key(endpoint: str, params: dict = None) -> str:
    """Generate cache key for API endpoints"""
    if params:
        param_str = "_".join([f"{k}:{v}" for k, v in sorted(params.items())])
        return f"api:{endpoint}:{param_str}"
    return f"api:{endpoint}"

# Cache management functions
def clear_user_cache(user_id: int):
    """Clear all cache for a specific user"""
    redis_cache.delete_pattern(f"user:{user_id}:*")

def clear_tenant_cache(tenant_id: int):
    """Clear all cache for a specific tenant"""
    redis_cache.delete_pattern(f"tenant:{tenant_id}:*")

def clear_api_cache(endpoint: str = None):
    """Clear API cache"""
    if endpoint:
        redis_cache.delete_pattern(f"api:{endpoint}:*")
    else:
        redis_cache.delete_pattern("api:*")

def get_cache_stats() -> dict:
    """Get cache statistics"""
    if not redis_cache.is_connected():
        return {"connected": False}
    
    try:
        info = redis_cache.redis_client.info()
        return {
            "connected": True,
            "used_memory": info.get("used_memory_human", "0B"),
            "connected_clients": info.get("connected_clients", 0),
            "total_commands_processed": info.get("total_commands_processed", 0),
            "keyspace_hits": info.get("keyspace_hits", 0),
            "keyspace_misses": info.get("keyspace_misses", 0),
        }
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        return {"connected": False, "error": str(e)}
