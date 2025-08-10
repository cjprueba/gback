# PowerShell Deployment Script for Gestor Backend (Container Registry)

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "status", "delete", "build-push")]
    [string]$Action = "deploy",
    [Parameter(Position=1)]
    [string]$Registry = "localhost:5000"
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

# Function to build and push Docker image
function Build-Push-Image {
    Write-Status "Building and pushing Docker image to $Registry..."
    
    $ImageTag = "$Registry/gestor-backend:latest"
    
    # Build image
    docker build -t $ImageTag ..
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build Docker image"
        exit 1
    }
    
    # Push image
    docker push $ImageTag
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push Docker image"
        exit 1
    }
    
    Write-Status "Docker image built and pushed successfully"
}

# Function to deploy to default namespace
function Deploy-Registry {
    Write-Status "Deploying to default namespace..."
    
    # Deploy infrastructure (PostgreSQL + MinIO + Secrets)
    kubectl apply -f infrastructure-default-namespace.yaml
    
    # Wait for PostgreSQL to be ready
    Write-Status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgresql --timeout=300s
    
    # Wait for MinIO to be ready
    Write-Status "Waiting for MinIO to be ready..."
    kubectl wait --for=condition=ready pod -l app=minio --timeout=300s
    
    # Update deployment with registry image
    $ImageTag = "$Registry/gestor-backend:latest"
    kubectl apply -f deployment-registry.yaml
    
    Write-Status "Deployment completed successfully!"
    Write-Status "PostgreSQL is available at: postgresql:5432"
    Write-Status "MinIO API is available at: minio-service:9000"
    Write-Status "MinIO Console is available at: minio-service:9001"
    Write-Status "Application is available at: gestor-backend-service:80"
}

# Function to check deployment status
function Get-Status {
    Write-Status "Checking deployment status..."
    
    Write-Host "Pods:" -ForegroundColor Cyan
    kubectl get pods -l app=gestor-backend
    kubectl get pods -l app=postgresql
    kubectl get pods -l app=minio
    
    Write-Host "`nServices:" -ForegroundColor Cyan
    kubectl get services -l app=gestor-backend
    kubectl get services -l app=postgresql
    kubectl get services -l app=minio
    
    Write-Host "`nDeployments:" -ForegroundColor Cyan
    kubectl get deployments -l app=gestor-backend
    kubectl get deployments -l app=postgresql
    kubectl get deployments -l app=minio
    
    Write-Host "`nPersistent Volume Claims:" -ForegroundColor Cyan
    kubectl get pvc
}

# Function to delete deployment
function Remove-Deployment {
    Write-Warning "Deleting deployment..."
    kubectl delete -f infrastructure-default-namespace.yaml --ignore-not-found=true
    kubectl delete -f deployment-registry.yaml --ignore-not-found=true
    Write-Status "Deployment deleted"
}

# Main script logic
switch ($Action) {
    "build-push" {
        Build-Push-Image
    }
    "deploy" {
        Build-Push-Image
        Deploy-Registry
        Get-Status
    }
    "status" {
        Get-Status
    }
    "delete" {
        Remove-Deployment
    }
    default {
        Write-Host "Usage: .\deploy-registry.ps1 {deploy|status|delete|build-push} [registry]" -ForegroundColor Cyan
        Write-Host "  deploy     - Build, push image and deploy to default namespace" -ForegroundColor White
        Write-Host "  status     - Check deployment status" -ForegroundColor White
        Write-Host "  delete     - Delete deployment" -ForegroundColor White
        Write-Host "  build-push - Build and push Docker image only" -ForegroundColor White
        Write-Host "  registry   - Container registry (default: localhost:5000)" -ForegroundColor White
        exit 1
    }
}
