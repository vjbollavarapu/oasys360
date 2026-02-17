"""
Custom authentication backends for OASYS Platform
Supports email-based authentication
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that authenticates users by email instead of username.
    This is necessary because our User model uses email as USERNAME_FIELD.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate using email as the username field.
        
        Args:
            request: The request object
            username: Can be either email or username
            password: The user's password
            **kwargs: Additional keyword arguments
        
        Returns:
            User object if authentication succeeds, None otherwise
        """
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        if username is None or password is None:
            return None
        
        try:
            # Try to find user by email (USERNAME_FIELD)
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            # Try to find user by username as fallback
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                # Run the default password hasher once to reduce the timing
                # difference between an existing and a non-existing user
                User().set_password(password)
                return None
        
        # Check password and if user is active
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None

