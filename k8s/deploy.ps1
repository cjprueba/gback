# PowerShell Deployment Script for Gestor Backend

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "status", "delete", "logs")]
    [string]$Action = "deploy"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if kubectl is installed
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Error "kubectl is not installed. Please install kubectl first."
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Please install Docker first."
    exit 1
}

# Function to build Docker image
function Build-Image {
    Write-Status "Building Docker image..."
    docker build -t gestor-backend:latest .
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Docker image built successfully"
    } else {
        Write-Error "Failed to build Docker image"
        exit 1
    }
}

# Function to deploy to Kubernetes
function Deploy-ToK8s {
    Write-Status "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl apply -f namespace.yaml
    
    # Apply secrets
    kubectl apply -f secrets.yaml
    
    # Deploy PostgreSQL
    kubectl apply -f postgresql-deployment.yaml
    
    # Wait for PostgreSQL to be ready
    Write-Status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgresql -n gestor-backend --timeout=300s
    
    # Deploy MinIO
    kubectl apply -f minio-deployment.yaml
    
    # Wait for MinIO to be ready
    Write-Status "Waiting for MinIO to be ready..."
    kubectl wait --for=condition=ready pod -l app=minio -n gestor-backend --timeout=300s
    
    # Deploy main application
    kubectl apply -f deployment.yaml
    kubectl apply -f service.yaml
    kubectl apply -f ingress.yaml
    
    Write-Status "Deployment completed successfully!"
}

# Function to check deployment status
function Get-Status {
    Write-Status "Checking deployment status..."
    
    Write-Host "Pods:" -ForegroundColor Cyan
    kubectl get pods -n gestor-backend
    
    Write-Host "`nServices:" -ForegroundColor Cyan
    kubectl get services -n gestor-backend
    
    Write-Host "`nDeployments:" -ForegroundColor Cyan
    kubectl get deployments -n gestor-backend
}

# Function to delete deployment
function Remove-Deployment {
    Write-Warning "Deleting deployment..."
    kubectl delete -f . --ignore-not-found=true
    kubectl delete namespace gestor-backend --ignore-not-found=true
    Write-Status "Deployment deleted"
}

# Function to show logs
function Show-Logs {
    kubectl logs -f deployment/gestor-backend -n gestor-backend
}

# Main script logic
switch ($Action) {
    "deploy" {
        Build-Image
        Deploy-ToK8s
        Get-Status
    }
    "status" {
        Get-Status
    }
    "delete" {
        Remove-Deployment
    }
    "logs" {
        Show-Logs
    }
    default {
        Write-Host "Usage: .\deploy.ps1 {deploy|status|delete|logs}" -ForegroundColor Cyan
        Write-Host "  deploy  - Build image and deploy to Kubernetes" -ForegroundColor White
        Write-Host "  status  - Check deployment status" -ForegroundColor White
        Write-Host "  delete  - Delete deployment" -ForegroundColor White
        Write-Host "  logs    - Show application logs" -ForegroundColor White
        exit 1
    }
}
