# Gestor Backend Deployment Guide

This guide provides multiple deployment options for the Gestor Backend application.

## 🚨 Current Issue: Docker Desktop Not Running

The error you encountered indicates Docker Desktop is not running. Here are your options:

## Option 1: Start Docker Desktop (Recommended)

1. **Install Docker Desktop** (if not installed):
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer

2. **Start Docker Desktop**:
   - Open Docker Desktop application
   - Wait for it to fully start (check system tray)
   - Verify: `docker --version`

3. **Then deploy normally**:
   ```powershell
   cd k8s
   .\deploy.ps1 deploy
   ```

## Option 2: Deploy Infrastructure Only (Quick Start)

Deploy PostgreSQL and MinIO without the application:

```powershell
cd k8s
.\deploy-infrastructure.ps1 deploy
```

This will give you:
- ✅ PostgreSQL database
- ✅ MinIO object storage
- ✅ All services and secrets

## Option 3: Use Public Node.js Image (No Docker Build)

Deploy using a public Node.js image with your source code mounted:

```powershell
# First deploy infrastructure
.\deploy-infrastructure.ps1 deploy

# Then deploy the application
kubectl apply -f deployment-public-image.yaml
kubectl apply -f service.yaml
```

## Option 4: Manual Step-by-Step Deployment

### Step 1: Deploy Infrastructure
```powershell
# Create namespace
kubectl apply -f namespace.yaml

# Apply secrets
kubectl apply -f secrets.yaml

# Deploy PostgreSQL
kubectl apply -f postgresql-deployment.yaml

# Deploy MinIO
kubectl apply -f minio-deployment.yaml

# Wait for services to be ready
kubectl wait --for=condition=ready pod -l app=postgresql -n gestor-backend --timeout=300s
kubectl wait --for=condition=ready pod -l app=minio -n gestor-backend --timeout=300s
```

### Step 2: Check Infrastructure Status
```powershell
kubectl get pods -n gestor-backend
kubectl get services -n gestor-backend
```

### Step 3: Deploy Application (Choose one)

**Option A: With Docker Desktop running**
```powershell
# Build and deploy
docker build -t gestor-backend:latest .
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

**Option B: Using public image**
```powershell
kubectl apply -f deployment-public-image.yaml
kubectl apply -f service.yaml
```

## 🔍 Troubleshooting

### Check if Docker Desktop is running:
```powershell
docker --version
docker ps
```

### Check Kubernetes cluster:
```powershell
kubectl cluster-info
kubectl get nodes
```

### Check deployment status:
```powershell
kubectl get pods -n gestor-backend
kubectl describe pod <pod-name> -n gestor-backend
```

### View logs:
```powershell
kubectl logs <pod-name> -n gestor-backend
```

## 🌐 Accessing Services

### PostgreSQL:
```powershell
kubectl port-forward service/postgresql 5432:5432 -n gestor-backend
```

### MinIO Console:
```powershell
kubectl port-forward service/minio-service 9001:9001 -n gestor-backend
# Then visit: http://localhost:9001
# Login: minioadmin / minioadmin
```

### Application (if deployed):
```powershell
kubectl port-forward service/gestor-backend-service 8080:80 -n gestor-backend
# Then visit: http://localhost:8080
```

## 📋 Prerequisites Checklist

- [ ] Kubernetes cluster (minikube, kind, or cloud)
- [ ] kubectl CLI tool
- [ ] Docker Desktop (for Option 1)
- [ ] PowerShell (for Windows scripts)

## 🎯 Recommended Next Steps

1. **Start with Option 2** (Infrastructure only) to verify your Kubernetes setup
2. **Fix Docker Desktop** if you want to build custom images
3. **Deploy the full application** once infrastructure is working

## 🆘 Need Help?

If you continue having issues:

1. **Check Docker Desktop status**
2. **Verify Kubernetes cluster is running**
3. **Check network connectivity**
4. **Review logs for specific error messages**

The infrastructure deployment (Option 2) is the safest starting point and will help identify any Kubernetes-related issues.
