#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Function to build Docker image
build_image() {
    print_status "Building Docker image..."
    docker build -t gestor-backend:latest .
    if [ $? -eq 0 ]; then
        print_status "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Function to deploy to Kubernetes
deploy_to_k8s() {
    print_status "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl apply -f namespace.yaml
    
    # Apply secrets
    kubectl apply -f secrets.yaml
    
    # Deploy PostgreSQL
    kubectl apply -f postgresql-deployment.yaml
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgresql -n gestor-backend --timeout=300s
    
    # Deploy MinIO
    kubectl apply -f minio-deployment.yaml
    
    # Wait for MinIO to be ready
    print_status "Waiting for MinIO to be ready..."
    kubectl wait --for=condition=ready pod -l app=minio -n gestor-backend --timeout=300s
    
    # Deploy main application
    kubectl apply -f deployment.yaml
    kubectl apply -f service.yaml
    kubectl apply -f ingress.yaml
    
    print_status "Deployment completed successfully!"
}

# Function to check deployment status
check_status() {
    print_status "Checking deployment status..."
    
    echo "Pods:"
    kubectl get pods -n gestor-backend
    
    echo -e "\nServices:"
    kubectl get services -n gestor-backend
    
    echo -e "\nDeployments:"
    kubectl get deployments -n gestor-backend
}

# Function to delete deployment
delete_deployment() {
    print_warning "Deleting deployment..."
    kubectl delete -f . --ignore-not-found=true
    kubectl delete namespace gestor-backend --ignore-not-found=true
    print_status "Deployment deleted"
}

# Main script logic
case "$1" in
    "deploy")
        build_image
        deploy_to_k8s
        check_status
        ;;
    "status")
        check_status
        ;;
    "delete")
        delete_deployment
        ;;
    "logs")
        kubectl logs -f deployment/gestor-backend -n gestor-backend
        ;;
    *)
        echo "Usage: $0 {deploy|status|delete|logs}"
        echo "  deploy  - Build image and deploy to Kubernetes"
        echo "  status  - Check deployment status"
        echo "  delete  - Delete deployment"
        echo "  logs    - Show application logs"
        exit 1
        ;;
esac
