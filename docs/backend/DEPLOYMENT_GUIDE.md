# OASYS Platform - Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## 🌟 Overview

This guide covers deploying the OASYS Platform to production environments using Docker and best practices for scalability, security, and monitoring.

## 🔧 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ minimum, 16GB+ recommended
- **Storage**: 50GB+ available space
- **Network**: Stable internet connection

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Latest version
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

## 🛠️ Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/oasys-platform.git
cd oasys-platform/backend
```

### 2. Environment Variables
Create `.env` file in the project root:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Database
DB_NAME=oasys_db
DB_USER=oasys_user
DB_PASSWORD=your-secure-db-password
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@your-domain.com

# AWS S3 (Optional)
USE_S3=False
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name

# Monitoring
GRAFANA_PASSWORD=your-grafana-password

# Security
DJANGO_SUPERUSER_EMAIL=admin@your-domain.com
DJANGO_SUPERUSER_PASSWORD=your-admin-password
```

### 3. Generate Secret Key
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 🐳 Docker Deployment

### 1. Build and Start Services
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 2. Initialize Database
```bash
# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Load initial data (optional)
docker-compose exec web python manage.py loaddata initial_data.json
```

### 3. Collect Static Files
```bash
docker-compose exec web python manage.py collectstatic --noinput
```

### 4. Verify Deployment
```bash
# Check application health
curl http://localhost:8000/health/

# Check API documentation
curl http://localhost:8000/swagger/
```

## 🚀 Production Deployment

### 1. Production Environment Setup

#### Using Docker Compose (Recommended)
```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Or with environment-specific settings
DJANGO_SETTINGS_MODULE=backend.production_settings docker-compose up -d
```

#### Manual Deployment
```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install -y python3.12 python3.12-venv postgresql redis-server nginx

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Setup database
sudo -u postgres createdb oasys_db
sudo -u postgres createuser oasys_user

# Run migrations
python manage.py migrate --settings=backend.production_settings

# Collect static files
python manage.py collectstatic --noinput --settings=backend.production_settings

# Setup Gunicorn
sudo cp deployment/gunicorn.service /etc/systemd/system/
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

# Setup Nginx
sudo cp deployment/nginx.conf /etc/nginx/sites-available/oasys
sudo ln -s /etc/nginx/sites-available/oasys /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 2. SSL Certificate Setup

#### Using Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Using Custom Certificate
```bash
# Copy certificates to nginx
sudo cp your-cert.pem /etc/nginx/ssl/
sudo cp your-key.pem /etc/nginx/ssl/

# Update nginx configuration
sudo nano /etc/nginx/sites-available/oasys
```

### 3. Database Setup

#### PostgreSQL Configuration
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Add performance optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### Database Backup Setup
```bash
# Create backup script
sudo nano /usr/local/bin/oasys-backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/oasys"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U oasys_user oasys_db > $BACKUP_DIR/db_backup_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /path/to/media/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Make executable
sudo chmod +x /usr/local/bin/oasys-backup.sh

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/oasys-backup.sh
```

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

#### Health Checks
```bash
# Application health
curl -f http://your-domain.com/health/

# Database health
docker-compose exec db pg_isready -U oasys_user

# Redis health
docker-compose exec redis redis-cli ping
```

#### Log Monitoring
```bash
# View application logs
docker-compose logs -f web

# View database logs
docker-compose logs -f db

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Performance Monitoring

#### Prometheus & Grafana
```bash
# Access Prometheus
http://your-domain.com:9090

# Access Grafana
http://your-domain.com:3000
# Default credentials: admin / your-grafana-password
```

#### Key Metrics to Monitor
- **Application**: Response time, error rate, throughput
- **Database**: Connection count, query performance, disk usage
- **System**: CPU, memory, disk I/O, network
- **Business**: User activity, transaction volume, revenue

### 3. Regular Maintenance

#### Daily Tasks
```bash
# Check service status
docker-compose ps

# Monitor logs for errors
docker-compose logs --tail=100 web | grep ERROR

# Check disk usage
df -h
```

#### Weekly Tasks
```bash
# Update dependencies
docker-compose pull
docker-compose build --no-cache

# Database maintenance
docker-compose exec db psql -U oasys_user -d oasys_db -c "VACUUM ANALYZE;"

# Clean old logs
sudo find /var/log -name "*.log" -mtime +7 -delete
```

#### Monthly Tasks
```bash
# Security updates
sudo apt-get update && sudo apt-get upgrade

# SSL certificate renewal check
sudo certbot renew --dry-run

# Performance review
# Analyze slow queries, optimize indexes
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
docker-compose exec db pg_isready -U oasys_user

# Check database logs
docker-compose logs db

# Reset database (development only)
docker-compose down -v
docker-compose up -d db
docker-compose exec web python manage.py migrate
```

#### 2. Static Files Not Loading
```bash
# Recollect static files
docker-compose exec web python manage.py collectstatic --noinput

# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h

# Optimize PostgreSQL
docker-compose exec db psql -U oasys_user -d oasys_db -c "SELECT pg_size_pretty(pg_database_size('oasys_db'));"

# Clear cache
docker-compose exec redis redis-cli FLUSHALL
```

#### 4. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in /etc/nginx/ssl/your-cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew

# Test nginx configuration
sudo nginx -t
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_user_email ON authentication_user(email);
CREATE INDEX idx_tenant_active ON tenants_tenant(is_active);
CREATE INDEX idx_invoice_date ON invoicing_invoice(invoice_date);

-- Analyze table statistics
ANALYZE authentication_user;
ANALYZE tenants_tenant;
ANALYZE invoicing_invoice;
```

#### 2. Caching Optimization
```python
# Add caching to frequently accessed data
from django.core.cache import cache

def get_user_profile(user_id):
    cache_key = f'user_profile_{user_id}'
    profile = cache.get(cache_key)
    if not profile:
        profile = UserProfile.objects.get(user_id=user_id)
        cache.set(cache_key, profile, 3600)  # Cache for 1 hour
    return profile
```

#### 3. Static File Optimization
```bash
# Enable gzip compression
sudo nano /etc/nginx/nginx.conf

# Add to http block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## 🔒 Security Checklist

### 1. Production Security
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong SECRET_KEY generated
- [ ] DEBUG=False in production
- [ ] ALLOWED_HOSTS properly configured
- [ ] Database password is strong
- [ ] Firewall rules configured
- [ ] Regular security updates applied

### 2. Access Control
- [ ] Superuser account created with strong password
- [ ] Database access restricted to application only
- [ ] SSH key-based authentication enabled
- [ ] Unnecessary ports closed
- [ ] Rate limiting configured

### 3. Backup Strategy
- [ ] Automated daily backups configured
- [ ] Backup retention policy defined
- [ ] Backup restoration tested
- [ ] Off-site backup storage configured
- [ ] Backup encryption enabled

## 📞 Support

For deployment support:
- **Documentation**: https://docs.oasys-platform.com
- **GitHub Issues**: https://github.com/your-org/oasys-platform/issues
- **Email**: support@oasys-platform.com

## 🎯 Next Steps

After successful deployment:
1. **Configure monitoring alerts**
2. **Set up automated backups**
3. **Implement CI/CD pipeline**
4. **Plan scaling strategy**
5. **Document runbooks**
6. **Train operations team**
