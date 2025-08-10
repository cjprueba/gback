# PowerShell Deployment Script with RBAC for Gestor Backend

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "status", "delete", "setup-rbac")]
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

# Function to setup RBAC permissions
function Setup-RBAC {
    Write-Status "Setting up RBAC permissions..."
    
    # Apply cluster-level RBAC first
    kubectl apply -f cluster-rbac.yaml
    
    # Create namespace
    kubectl apply -f namespace.yaml
    
    # Apply namespace-level RBAC
    kubectl apply -f rbac.yaml
    
    Write-Status "RBAC setup completed!"
}

# Function to deploy infrastructure to Kubernetes
function Deploy-Infrastructure {
    Write-Status "Deploying infrastructure to Kubernetes..."
    
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
    
    Write-Status "Infrastructure deployment completed successfully!"
    Write-Status "PostgreSQL is available at: postgresql:5432"
    Write-Status "MinIO API is available at: minio-service:9000"
    Write-Status "MinIO Console is available at: minio-service:9001"
}

# Function to check deployment status
function Get-Status {
    Write-Status "Checking infrastructure status..."
    
    Write-Host "Pods:" -ForegroundColor Cyan
    kubectl get pods -n gestor-backend
    
    Write-Host "`nServices:" -ForegroundColor Cyan
    kubectl get services -n gestor-backend
    
    Write-Host "`nDeployments:" -ForegroundColor Cyan
    kubectl get deployments -n gestor-backend
    
    Write-Host "`nPersistent Volume Claims:" -ForegroundColor Cyan
    kubectl get pvc -n gestor-backend
}

# Function to delete deployment
function Remove-Deployment {
    Write-Warning "Deleting deployment..."
    kubectl delete -f . --ignore-not-found=true
    kubectl delete namespace gestor-backend --ignore-not-found=true
    kubectl delete -f cluster-rbac.yaml --ignore-not-found=true
    Write-Status "Deployment deleted"
}

# Main script logic
switch ($Action) {
    "setup-rbac" {
        Setup-RBAC
    }
    "deploy" {
        Setup-RBAC
        Deploy-Infrastructure
        Get-Status
    }
    "status" {
        Get-Status
    }
    "delete" {
        Remove-Deployment
    }
    default {
        Write-Host "Usage: .\deploy-with-rbac.ps1 {deploy|status|delete|setup-rbac}" -ForegroundColor Cyan
        Write-Host "  setup-rbac - Setup RBAC permissions only" -ForegroundColor White
        Write-Host "  deploy     - Setup RBAC and deploy infrastructure" -ForegroundColor White
        Write-Host "  status     - Check deployment status" -ForegroundColor White
        Write-Host "  delete     - Delete deployment and RBAC" -ForegroundColor White
        exit 1
    }
}
