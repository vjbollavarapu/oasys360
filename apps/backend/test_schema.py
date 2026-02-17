#!/usr/bin/env python
"""
Quick test script to verify schema generation works
Run from backend directory: python test_schema.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from drf_spectacular.views import SpectacularAPIView
from django.urls import path, include
from backend.urls import api_patterns

# Create a schema view instance
schema_view = SpectacularAPIView.as_view(
    patterns=[path('api/v1/', include(api_patterns))],
    permission_classes=[],
    authentication_classes=[],
)

# Mock request
from django.http import HttpRequest
from django.test import RequestFactory

factory = RequestFactory()
request = factory.get('/api/schema/')

try:
    print("Testing schema generation...")
    response = schema_view(request)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        content = response.content.decode('utf-8')
        print(f"Content Length: {len(content)}")
        print(f"First 200 chars: {content[:200]}")
        
        # Check if it's JSON
        import json
        try:
            data = json.loads(content)
            print(f"✅ Valid JSON!")
            print(f"OpenAPI Version: {data.get('openapi', 'N/A')}")
            print(f"Title: {data.get('info', {}).get('title', 'N/A')}")
            print(f"Paths Count: {len(data.get('paths', {}))}")
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON: {e}")
            print(f"Content type: {response.get('Content-Type', 'N/A')}")
    else:
        print(f"❌ Error: Status {response.status_code}")
        print(f"Content: {response.content.decode('utf-8')[:500]}")
        
except Exception as e:
    print(f"❌ Exception: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

