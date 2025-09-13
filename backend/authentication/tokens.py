from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from authentication.serializers import UserSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that includes user information
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user information to the token response
        user = self.user
        data['user'] = UserSerializer(user).data
        data['tenant'] = {
            'id': str(user.tenant.id),
            'name': user.tenant.name,
            'plan': user.tenant.plan,
        } if user.tenant else None
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain view using our custom serializer
    """
    serializer_class = CustomTokenObtainPairSerializer
