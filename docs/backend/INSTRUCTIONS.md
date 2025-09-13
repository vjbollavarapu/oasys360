# OASYS Platform - Django Backend Implementation Instructions

## 🎯 **Overview**

This document provides step-by-step instructions for implementing the Django backend for the OASYS platform. The frontend is 100% complete with 117 pages and 99 components. This guide will help you build a robust Django backend to support all frontend features.

---

## 📋 **Prerequisites**

### **Required Software**
```bash
# Core requirements
- Python 3.9+
- PostgreSQL 14+
- Redis 6+
- Git

# Development tools
- PyCharm/VS Code
- Postman (for API testing)
- Docker (optional but recommended)
```

### **System Setup**
```bash
# Install Python dependencies
sudo apt-get update  # Ubuntu/Debian
sudo apt-get install python3.9 python3.9-venv python3.9-dev

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Redis
sudo apt-get install redis-server
```

---

## 🚀 **Step 1: Django Project Setup**

### **1.1 Create Django Project**
```bash
# Create project directory
mkdir oasys_backend
cd oasys_backend

# Create virtual environment
python3.9 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Django and core dependencies
pip install django==4.2.0
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.0.0
pip install psycopg2-binary==2.9.6
pip install python-decouple==3.8

# Create Django project
django-admin startproject oasys .
```

### **1.2 Create Django Apps**
```bash
# Create apps for each module
python manage.py startapp authentication
python manage.py startapp tenants
python manage.py startapp accounting
python manage.py startapp invoicing
python manage.py startapp banking
python manage.py startapp ai_processing
python manage.py startapp web3
python manage.py startapp sales
python manage.py startapp purchase
python manage.py startapp inventory
python manage.py startapp reporting
python manage.py startapp documents
python manage.py startapp mobile
python manage.py startapp platform_admin
```

### **1.3 Configure Settings**
```python
# oasys/settings.py
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    'django_filters',
    
    # Local apps
    'authentication',
    'tenants',
    'accounting',
    'invoicing',
    'banking',
    'ai_processing',
    'web3',
    'sales',
    'purchase',
    'inventory',
    'reporting',
    'documents',
    'mobile',
    'platform_admin',
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='oasys'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Frontend URL
    "http://127.0.0.1:3000",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### **1.4 Environment Variables**
```bash
# .env
DEBUG=True
SECRET_KEY=your-super-secure-secret-key-here
DB_NAME=oasys
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET=your-s3-bucket
```

---

## 🗄️ **Step 2: Database Models**

### **2.1 Authentication Models**
```python
# authentication/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, null=True, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=[
        ('platform_admin', 'Platform Admin'),
        ('tenant_admin', 'Tenant Admin'),
        ('firm_admin', 'Firm Admin'),
        ('cfo', 'CFO'),
        ('accountant', 'Accountant'),
        ('staff', 'Staff'),
    ])
    permissions = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    two_factor_enabled = models.BooleanField(default=False)
    web3_wallet_address = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'user_profiles'
```

### **2.2 Tenant Models**
```python
# tenants/models.py
from django.db import models
import uuid

class Tenant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    domain = models.CharField(max_length=255, unique=True, null=True, blank=True)
    plan = models.CharField(max_length=50, default='basic', choices=[
        ('basic', 'Basic'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tenants'

class Company(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    tax_id = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    currency = models.CharField(max_length=3, default='USD')
    timezone = models.CharField(max_length=50, default='UTC')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
```

### **2.3 Accounting Models**
```python
# accounting/models.py
from django.db import models
import uuid

class ChartOfAccounts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=[
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
    ])
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chart_of_accounts'
        unique_together = ['tenant', 'code']

class JournalEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    date = models.DateField()
    reference = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(max_length=20, default='draft', choices=[
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('cancelled', 'Cancelled'),
    ])
    created_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE)
    approved_by = models.ForeignKey('authentication.User', on_delete=models.CASCADE, null=True, blank=True, related_name='approved_entries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'journal_entries'

class JournalEntryLine(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines')
    account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE)
    description = models.TextField()
    debit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'journal_entry_lines'
```

### **2.4 Run Migrations**
```bash
# Create and run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

---

## 🔐 **Step 3: Authentication System**

### **3.1 Install JWT Dependencies**
```bash
pip install djangorestframework-simplejwt
```

### **3.2 Authentication Serializers**
```python
# authentication/serializers.py
from rest_framework import serializers
from .models import User, UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'permissions', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'role']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
```

### **3.3 Authentication Views**
```python
# authentication/views.py
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer
from .models import User

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(username=email, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            })
        else:
            return Response({
                'success': False,
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)
```

### **3.4 Authentication URLs**
```python
# authentication/urls.py
from django.urls import path
from .views import LoginView, RegisterView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
]
```

---

## 📊 **Step 4: Core APIs**

### **4.1 Accounting APIs**
```python
# accounting/serializers.py
from rest_framework import serializers
from .models import ChartOfAccounts, JournalEntry, JournalEntryLine

class ChartOfAccountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccounts
        fields = '__all__'

class JournalEntryLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntryLine
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True, read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = '__all__'
    
    def validate(self, data):
        # Validate debits equal credits
        lines_data = self.context.get('lines_data', [])
        total_debits = sum(line.get('debit_amount', 0) for line in lines_data)
        total_credits = sum(line.get('credit_amount', 0) for line in lines_data)
        
        if abs(total_debits - total_credits) > 0.01:
            raise serializers.ValidationError("Debits must equal credits")
        
        return data
```

### **4.2 Accounting Views**
```python
# accounting/views.py
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import ChartOfAccounts, JournalEntry
from .serializers import ChartOfAccountsSerializer, JournalEntrySerializer

class ChartOfAccountsListCreateView(generics.ListCreateAPIView):
    serializer_class = ChartOfAccountsSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name']

    def get_queryset(self):
        return ChartOfAccounts.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class JournalEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = JournalEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'date']
    search_fields = ['reference', 'description']
    ordering_fields = ['date', 'created_at']

    def get_queryset(self):
        return JournalEntry.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.user.tenant,
            created_by=self.request.user
        )
```

### **4.3 Accounting URLs**
```python
# accounting/urls.py
from django.urls import path
from .views import ChartOfAccountsListCreateView, JournalEntryListCreateView

urlpatterns = [
    path('chart-of-accounts/', ChartOfAccountsListCreateView.as_view(), name='chart-of-accounts-list'),
    path('journal-entries/', JournalEntryListCreateView.as_view(), name='journal-entries-list'),
]
```

---

## 🔗 **Step 5: URL Configuration**

### **5.1 Main URLs**
```python
# oasys/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/accounting/', include('accounting.urls')),
    path('api/invoicing/', include('invoicing.urls')),
    path('api/banking/', include('banking.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/purchase/', include('purchase.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/reports/', include('reporting.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/mobile/', include('mobile.urls')),
    path('api/web3/', include('web3.urls')),
    path('api/ai/', include('ai_processing.urls')),
    path('api/admin/', include('platform_admin.urls')),
]
```

---

## 🧪 **Step 6: Testing**

### **6.1 Unit Tests**
```python
# accounting/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import ChartOfAccounts, JournalEntry

class AccountingTestCase(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.tenant = Tenant.objects.create(name='Test Tenant')
        self.user.tenant = self.tenant
        self.user.save()

    def test_create_chart_of_accounts(self):
        account = ChartOfAccounts.objects.create(
            tenant=self.tenant,
            code='1000',
            name='Cash',
            type='asset'
        )
        self.assertEqual(account.code, '1000')
        self.assertEqual(account.name, 'Cash')
```

### **6.2 API Tests**
```python
# accounting/tests_api.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class ChartOfAccountsAPITestCase(APITestCase):
    def setUp(self):
        # Setup test data
        pass

    def test_list_accounts(self):
        url = reverse('chart-of-accounts-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_account(self):
        url = reverse('chart-of-accounts-list')
        data = {
            'code': '1000',
            'name': 'Cash',
            'type': 'asset'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```

### **6.3 Run Tests**
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test accounting

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

---

## 🚀 **Step 7: Development Server**

### **7.1 Start Development**
```bash
# Start Django development server
python manage.py runserver

# Start Redis (for caching)
redis-server

# Test API endpoints
curl http://localhost:8000/api/auth/login/
```

### **7.2 API Testing with Postman**
```bash
# Import this collection to Postman
{
  "info": {
    "name": "OASYS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:8000/api/auth/login/",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@oasys.com\",\"password\":\"admin123\"}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

---

## 📦 **Step 8: Additional Dependencies**

### **8.1 Install Advanced Features**
```bash
# AI and ML
pip install openai==0.27.8
pip install google-cloud-vision==3.4.4
pip install pytesseract==0.3.10

# Web3
pip install web3==6.0.0
pip install eth-account==0.8.0

# File storage
pip install django-storages==1.13.2
pip install boto3==1.26.137
pip install Pillow==9.5.0

# Additional Django packages
pip install django-filter==23.0
pip install django-extensions==3.2.0
pip install drf-yasg==1.21.5
pip install django-guardian==2.4.0
pip install django-ratelimit==4.0.0
```

---

## 🔧 **Step 9: Production Setup**

### **9.1 Production Settings**
```python
# oasys/settings_production.py
from .settings import *

DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Database (use environment variables)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
```

### **9.2 Docker Setup**
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "oasys.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:password@db:5432/oasys
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=oasys
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine

volumes:
  postgres_data:
```

---

## 📚 **Step 10: Documentation**

### **10.1 API Documentation**
```bash
# Install drf-yasg for Swagger
pip install drf-yasg

# Add to settings.py
INSTALLED_APPS += ['drf_yasg']

# Add to urls.py
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="OASYS API",
      default_version='v1',
      description="OASYS Platform API Documentation",
   ),
   public=True,
)

urlpatterns += [
   path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
```

---

## ✅ **Implementation Checklist**

### **Week 1: Foundation**
- [ ] Django project setup
- [ ] Database configuration
- [ ] Basic models (User, Tenant)
- [ ] Authentication system
- [ ] Basic API endpoints

### **Week 2: Core Features**
- [ ] Accounting models and APIs
- [ ] Invoicing models and APIs
- [ ] Banking models and APIs
- [ ] User management
- [ ] File upload system

### **Week 3: Business Logic**
- [ ] Journal entry validation
- [ ] Invoice generation
- [ ] Bank reconciliation
- [ ] Reporting system
- [ ] Advanced filtering

### **Week 4: Advanced Features**
- [ ] AI integration
- [ ] Web3 integration
- [ ] Mobile APIs
- [ ] Real-time features
- [ ] Performance optimization

### **Week 5: Testing & Deployment**
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation
- [ ] Production deployment
- [ ] Monitoring setup

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- API response time < 200ms
- 99.9% uptime
- < 0.1% error rate
- > 90% test coverage

### **Development Metrics**
- All 117 frontend pages functional
- All 99 components integrated
- Complete API documentation
- Production-ready deployment

---

## 🔄 **Next Steps**

1. **Follow this guide step-by-step**
2. **Test each component thoroughly**
3. **Integrate with frontend**
4. **Deploy to production**
5. **Monitor and optimize**

---

**OASYS Platform** - Django Backend Implementation Complete

This guide provides everything needed to build a robust Django backend that fully supports the OASYS platform frontend. Follow each step carefully and test thoroughly before moving to the next phase.
