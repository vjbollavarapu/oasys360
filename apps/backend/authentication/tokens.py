from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.serializers import UserSerializer
from django.utils import timezone


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that includes user and tenant information
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user information to the token response
        user = self.user
        data['user'] = UserSerializer(user).data
        
        # Add tenant information
        if user.tenant:
            data['tenant'] = {
                'id': str(user.tenant.id),
                'name': user.tenant.name,
                'slug': user.tenant.slug,
                'plan': user.tenant.plan,
                'is_active': user.tenant.is_active,
                'features': user.tenant.features,
            }
        else:
            data['tenant'] = None
        
        # Add user role and permissions
        data['user']['role'] = user.role
        data['user']['permissions'] = user.permissions
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """
        Generate token with custom claims including tenant information
        """
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['permissions'] = user.permissions
        
        # Add tenant information to token
        if user.tenant:
            token['tenant_id'] = str(user.tenant.id)
            token['tenant_slug'] = user.tenant.slug
            token['tenant_plan'] = user.tenant.plan
        else:
            token['tenant_id'] = None
            token['tenant_slug'] = None
            token['tenant_plan'] = None
        
        return token


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    """
    Custom token refresh serializer that maintains tenant context
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Get the user from the refresh token
        refresh = RefreshToken(attrs['refresh'])
        user_id = refresh.payload.get('user_id')
        
        if user_id:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                
                # Add user and tenant information to refresh response
                data['user'] = UserSerializer(user).data
                
                if user.tenant:
                    data['tenant'] = {
                        'id': str(user.tenant.id),
                        'name': user.tenant.name,
                        'slug': user.tenant.slug,
                        'plan': user.tenant.plan,
                        'is_active': user.tenant.is_active,
                    }
                else:
                    data['tenant'] = None
            except User.DoesNotExist:
                data['user'] = None
                data['tenant'] = None
        else:
            data['user'] = None
            data['tenant'] = None
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view using our custom serializer
    """
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view using our custom serializer
    """
    serializer_class = CustomTokenRefreshSerializer
