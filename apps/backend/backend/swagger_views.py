"""
Custom Swagger views that force JSON format for better compatibility
"""
from drf_spectacular.views import SpectacularAPIView
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import AllowAny


class JSONSpectacularAPIView(SpectacularAPIView):
    """
    Custom SpectacularAPIView that always returns JSON format
    """
    renderer_classes = [JSONRenderer]
    permission_classes = [AllowAny]
    authentication_classes = []

