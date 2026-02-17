#!/bin/bash

# Kubernetes Deployment Script for Multi-Tenant Django/FastAPI Application
# This script automates the deployment of the entire multi-tenant system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="oasys360"
DEPLOYMENT_DIR="$(dirname "$0")"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    print_success "kubectl is available"
}

# Function to check if namespace exists
check_namespace() {
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_warning "Namespace $NAMESPACE already exists"
    else
        print_status "Creating namespace $NAMESPACE"
        kubectl apply -f "$DEPLOYMENT_DIR/namespace.yaml"
        print_success "Namespace $NAMESPACE created"
    fi
}

# Function to deploy database components
deploy_database() {
    print_status "Deploying database components..."
    
    # Deploy PostgreSQL
    print_status "Deploying PostgreSQL..."
    kubectl apply -f "$DEPLOYMENT_DIR/postgres-deployment.yaml"
    kubectl apply -f "$DEPLOYMENT_DIR/postgres-init-scripts.yaml"
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s
    
    print_success "PostgreSQL is ready"
}

# Function to deploy cache components
deploy_cache() {
    print_status "Deploying cache components..."
    
    # Deploy Redis
    print_status "Deploying Redis..."
    kubectl apply -f "$DEPLOYMENT_DIR/redis-deployment.yaml"
    
    # Wait for Redis to be ready
    print_status "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s
    
    print_success "Redis is ready"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Deploy migration job
    kubectl apply -f "$DEPLOYMENT_DIR/django-migration-job.yaml"
    
    # Wait for migration job to complete
    print_status "Waiting for migration job to complete..."
    kubectl wait --for=condition=complete job/django-migration-job -n "$NAMESPACE" --timeout=600s
    
    # Check migration job status
    if kubectl get job django-migration-job -n "$NAMESPACE" -o jsonpath='{.status.conditions[0].type}' | grep -q "Complete"; then
        print_success "Database migrations completed successfully"
    else
        print_error "Database migrations failed"
        kubectl logs job/django-migration-job -n "$NAMESPACE"
        exit 1
    fi
}

# Function to deploy application components
deploy_applications() {
    print_status "Deploying application components..."
    
    # Deploy Django application
    print_status "Deploying Django application..."
    kubectl apply -f "$DEPLOYMENT_DIR/django-deployment.yaml"
    
    # Deploy FastAPI application
    print_status "Deploying FastAPI application..."
    kubectl apply -f "$DEPLOYMENT_DIR/fastapi-deployment.yaml"
    
    # Wait for applications to be ready
    print_status "Waiting for Django application to be ready..."
    kubectl wait --for=condition=ready pod -l app=django -n "$NAMESPACE" --timeout=300s
    
    print_status "Waiting for FastAPI application to be ready..."
    kubectl wait --for=condition=ready pod -l app=fastapi -n "$NAMESPACE" --timeout=300s
    
    print_success "Applications are ready"
}

# Function to deploy monitoring components
deploy_monitoring() {
    print_status "Deploying monitoring components..."
    
    # Deploy Prometheus
    print_status "Deploying Prometheus..."
    kubectl apply -f "$DEPLOYMENT_DIR/monitoring-deployment.yaml"
    
    # Deploy tenant metrics exporter
    print_status "Deploying tenant metrics exporter..."
    kubectl apply -f "$DEPLOYMENT_DIR/tenant-metrics-exporter.yaml"
    
    # Wait for monitoring components to be ready
    print_status "Waiting for monitoring components to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=grafana -n "$NAMESPACE" --timeout=300s
    kubectl wait --for=condition=ready pod -l app=tenant-metrics-exporter -n "$NAMESPACE" --timeout=300s
    
    print_success "Monitoring components are ready"
}

# Function to deploy ingress
deploy_ingress() {
    print_status "Deploying ingress..."
    
    kubectl apply -f "$DEPLOYMENT_DIR/ingress.yaml"
    
    print_success "Ingress deployed"
}

# Function to deploy autoscaling
deploy_autoscaling() {
    print_status "Deploying autoscaling..."
    
    kubectl apply -f "$DEPLOYMENT_DIR/hpa.yaml"
    
    print_success "Autoscaling configured"
}

# Function to deploy network policies
deploy_network_policies() {
    print_status "Deploying network policies..."
    
    kubectl apply -f "$DEPLOYMENT_DIR/network-policies.yaml"
    
    print_success "Network policies deployed"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check all pods are running
    print_status "Checking pod status..."
    kubectl get pods -n "$NAMESPACE"
    
    # Check services
    print_status "Checking services..."
    kubectl get services -n "$NAMESPACE"
    
    # Check ingress
    print_status "Checking ingress..."
    kubectl get ingress -n "$NAMESPACE"
    
    # Check HPA
    print_status "Checking HPA..."
    kubectl get hpa -n "$NAMESPACE"
    
    print_success "Deployment verification completed"
}

# Function to show access information
show_access_info() {
    print_status "Deployment completed successfully!"
    echo ""
    print_status "Access Information:"
    echo "========================"
    
    # Get ingress IP
    INGRESS_IP=$(kubectl get ingress oasys360-ingress -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending")
    
    if [ "$INGRESS_IP" != "Pending" ] && [ -n "$INGRESS_IP" ]; then
        echo "Main Application: https://app.oasys360.com"
        echo "API Endpoints: https://api.oasys360.com"
        echo "Admin Panel: https://admin.oasys360.com"
        echo "Grafana Dashboard: https://grafana.oasys360.com"
        echo "Prometheus: https://prometheus.oasys360.com"
    else
        echo "Ingress IP is pending. Please check your ingress controller."
    fi
    
    echo ""
    print_status "Port Forward Access (for local development):"
    echo "kubectl port-forward -n $NAMESPACE service/django-service 8000:8000"
    echo "kubectl port-forward -n $NAMESPACE service/fastapi-service 8001:8000"
    echo "kubectl port-forward -n $NAMESPACE service/grafana-service 3000:3000"
    echo "kubectl port-forward -n $NAMESPACE service/prometheus-service 9090:9090"
    
    echo ""
    print_status "Monitoring Commands:"
    echo "kubectl logs -n $NAMESPACE -l app=django -f"
    echo "kubectl logs -n $NAMESPACE -l app=fastapi -f"
    echo "kubectl top pods -n $NAMESPACE"
    echo "kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
}

# Function to cleanup deployment
cleanup() {
    print_status "Cleaning up deployment..."
    
    # Delete all resources
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  deploy     Deploy the entire multi-tenant system"
    echo "  cleanup    Clean up the deployment"
    echo "  status     Show deployment status"
    echo "  logs       Show application logs"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 cleanup"
    echo "  $0 status"
    echo "  $0 logs"
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    echo "===================="
    
    # Check namespace
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_success "Namespace $NAMESPACE exists"
    else
        print_error "Namespace $NAMESPACE does not exist"
        return 1
    fi
    
    # Check pods
    print_status "Pod Status:"
    kubectl get pods -n "$NAMESPACE" -o wide
    
    # Check services
    print_status "Service Status:"
    kubectl get services -n "$NAMESPACE"
    
    # Check ingress
    print_status "Ingress Status:"
    kubectl get ingress -n "$NAMESPACE"
    
    # Check HPA
    print_status "HPA Status:"
    kubectl get hpa -n "$NAMESPACE"
}

# Function to show logs
show_logs() {
    print_status "Application Logs:"
    echo "==================="
    
    # Django logs
    print_status "Django Application Logs:"
    kubectl logs -n "$NAMESPACE" -l app=django --tail=50
    
    echo ""
    
    # FastAPI logs
    print_status "FastAPI Application Logs:"
    kubectl logs -n "$NAMESPACE" -l app=fastapi --tail=50
    
    echo ""
    
    # Database logs
    print_status "Database Logs:"
    kubectl logs -n "$NAMESPACE" -l app=postgres --tail=50
    
    echo ""
    
    # Redis logs
    print_status "Redis Logs:"
    kubectl logs -n "$NAMESPACE" -l app=redis --tail=50
}

# Main function
main() {
    case "${1:-deploy}" in
        deploy)
            print_status "Starting deployment of multi-tenant Django/FastAPI application..."
            check_kubectl
            check_namespace
            deploy_database
            deploy_cache
            run_migrations
            deploy_applications
            deploy_monitoring
            deploy_ingress
            deploy_autoscaling
            deploy_network_policies
            verify_deployment
            show_access_info
            ;;
        cleanup)
            cleanup
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
