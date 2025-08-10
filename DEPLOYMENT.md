# Gestor Backend Deployment Guide

This guide covers multiple deployment options for the Gestor Backend application, from local development to production environments.

## 🚀 Quick Start Options

### Option 1: Local Development (Recommended for testing)

**Prerequisites:**
- Docker
- kubectl
- Local Kubernetes cluster (minikube, kind, or Docker Desktop)

**Deploy:**
```bash
cd k8s
chmod +x deploy-local.sh
./deploy-local.sh deploy
```

### Option 2: Production Kubernetes

**Prerequisites:**
- kubectl configured for your cluster
- Docker registry access
- Domain name (for ingress)

**Deploy:**
```bash
cd k8s
chmod +x deploy.sh
./deploy.sh deploy
```

### Option 3: Helm Chart

**Prerequisites:**
- Helm 3.x
- kubectl configured

**Deploy:**
```bash
cd helm
helm install gestor-backend . --namespace gestor-backend --create-namespace
```

## 📋 Prerequisites

### Required Tools

1. **kubectl** - Kubernetes command-line tool
   ```bash
   # Install kubectl
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x kubectl
   sudo mv kubectl /usr/local/bin/
   ```

2. **Docker** - Container runtime
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. **Local Kubernetes Cluster** (for development)
   ```bash
   # Option A: minikube
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   minikube start

   # Option B: kind
   curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
   chmod +x ./kind
   sudo mv ./kind /usr/local/bin/kind
   kind create cluster
   ```

### Optional Tools

4. **Helm** - Kubernetes package manager
   ```bash
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

## 🏗️ Architecture Overview

The deployment includes:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Service       │    │   Pods          │
│   (External)    │───▶│   (Load Bal.)   │───▶│   (App)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │   MinIO         │            │
                       │   (Storage)     │◀───────────┘
                       └─────────────────┘
```

## 📁 Deployment Files Structure

```
k8s/
├── deployment.yaml          # Main application deployment
├── service.yaml            # Service for load balancing
├── ingress.yaml            # External access configuration
├── secrets.yaml            # Sensitive configuration
├── configmap.yaml          # Non-sensitive configuration
├── namespace.yaml          # Namespace isolation
├── persistent-volume-claim.yaml  # Database storage
├── database-deployment.yaml      # Database deployment
├── kustomization.yaml      # Kustomize configuration
├── deploy.sh               # Production deployment script
├── deploy-local.sh         # Local development script
└── README.md               # Detailed documentation

helm/
├── Chart.yaml              # Helm chart metadata
├── values.yaml             # Configurable parameters
└── templates/              # Helm templates
    └── deployment.yaml     # Deployment template
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Node.js environment | No | `production` |
| `DATABASE_URL` | Database connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `MINIO_ENDPOINT` | MinIO server endpoint | No | `minio-service` |
| `MINIO_PORT` | MinIO server port | No | `9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | Yes | - |
| `MINIO_SECRET_KEY` | MinIO secret key | Yes | - |
| `MINIO_BUCKET_NAME` | MinIO bucket name | No | `gestor-documents` |
| `MINIO_USE_SSL` | Use SSL for MinIO | No | `false` |

### Secrets Configuration

Create a `secrets.yaml` file with your actual values:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gestor-backend-secrets
type: Opaque
data:
  # Encode your values: echo -n "your-value" | base64
  database-url: <base64-encoded-database-url>
  jwt-secret: <base64-encoded-jwt-secret>
  minio-access-key: <base64-encoded-minio-access-key>
  minio-secret-key: <base64-encoded-minio-secret-key>
```

## 🚀 Deployment Methods

### Method 1: Local Development Deployment

**Best for:** Development, testing, and learning

```bash
# 1. Start local cluster
minikube start

# 2. Deploy application
cd k8s
./deploy-local.sh deploy

# 3. Access application
minikube service gestor-backend-service -n gestor-backend
```

**Features:**
- Automatic MinIO deployment
- Pre-configured secrets
- SQLite database with persistent storage
- Health checks and monitoring

### Method 2: Production Kubernetes Deployment

**Best for:** Production environments

```bash
# 1. Update secrets.yaml with your values
# 2. Build and push Docker image
docker build -t your-registry.com/gestor-backend:latest .
docker push your-registry.com/gestor-backend:latest

# 3. Deploy to cluster
cd k8s
./deploy.sh deploy
```

**Features:**
- Production-ready configuration
- SSL/TLS termination
- Resource limits and requests
- Horizontal pod autoscaling support

### Method 3: Helm Chart Deployment

**Best for:** Advanced deployments with customization

```bash
# 1. Customize values.yaml
# 2. Deploy with Helm
cd helm
helm install gestor-backend . \
  --namespace gestor-backend \
  --create-namespace \
  --set image.repository=your-registry.com/gestor-backend \
  --set image.tag=latest

# 3. Upgrade deployment
helm upgrade gestor-backend . \
  --set replicaCount=3
```

**Features:**
- Highly configurable
- Easy upgrades and rollbacks
- Environment-specific values
- Advanced Kubernetes features

## 🔍 Monitoring and Troubleshooting

### Check Deployment Status

```bash
# Check pods
kubectl get pods -n gestor-backend

# Check services
kubectl get services -n gestor-backend

# Check ingress
kubectl get ingress -n gestor-backend

# Check events
kubectl get events -n gestor-backend --sort-by='.lastTimestamp'
```

### View Logs

```bash
# Application logs
kubectl logs -f deployment/gestor-backend -n gestor-backend

# MinIO logs
kubectl logs -f deployment/minio -n gestor-backend
```

### Health Check

```bash
# Test health endpoint
curl http://localhost:3000/health

# Port forward for local access
kubectl port-forward service/gestor-backend-service 8080:80 -n gestor-backend
```

### Common Issues and Solutions

#### 1. Image Pull Errors
```bash
# Check if image exists
docker images | grep gestor-backend

# Rebuild and push image
docker build -t gestor-backend:latest .
docker push your-registry.com/gestor-backend:latest
```

#### 2. Database Connection Issues
```bash
# Check database pod
kubectl get pods -n gestor-backend | grep db

# Check database logs
kubectl logs deployment/gestor-backend-db -n gestor-backend
```

#### 3. MinIO Connection Issues
```bash
# Check MinIO service
kubectl get service minio-service -n gestor-backend

# Test MinIO connectivity
kubectl exec -it deployment/gestor-backend -n gestor-backend -- curl minio-service:9000
```

## 🔄 Scaling and Updates

### Scale Application

```bash
# Scale to 3 replicas
kubectl scale deployment gestor-backend -n gestor-backend --replicas=3

# Enable autoscaling
kubectl autoscale deployment gestor-backend -n gestor-backend \
  --cpu-percent=70 --min=2 --max=10
```

### Update Application

```bash
# Method 1: Rolling update
kubectl set image deployment/gestor-backend \
  gestor-backend=your-registry.com/gestor-backend:v2.0.0 \
  -n gestor-backend

# Method 2: Helm upgrade
helm upgrade gestor-backend . \
  --set image.tag=v2.0.0
```

## 🛡️ Security Considerations

### 1. Secrets Management
- Use Kubernetes secrets for sensitive data
- Rotate secrets regularly
- Consider external secret management (HashiCorp Vault, AWS Secrets Manager)

### 2. Network Security
- Implement network policies
- Use service mesh (Istio, Linkerd) for advanced traffic management
- Restrict pod-to-pod communication

### 3. Container Security
- Run containers as non-root users
- Use read-only root filesystems
- Scan images for vulnerabilities
- Implement pod security policies

### 4. Access Control
- Use RBAC for fine-grained permissions
- Implement service accounts
- Restrict cluster access

## 📊 Backup and Recovery

### Database Backup

```bash
# Create backup
kubectl exec -n gestor-backend deployment/gestor-backend-db \
  -- sqlite3 /data/database.db ".backup /data/backup.db"

# Copy backup to local machine
kubectl cp gestor-backend/gestor-backend-db-xxx:/data/backup.db ./backup.db
```

### Restore Database

```bash
# Copy backup to pod
kubectl cp ./backup.db gestor-backend/gestor-backend-db-xxx:/data/database.db

# Restart application to pick up changes
kubectl rollout restart deployment/gestor-backend -n gestor-backend
```

## 🧹 Cleanup

### Remove Deployment

```bash
# Method 1: Using scripts
cd k8s
./deploy.sh cleanup
# or
./deploy-local.sh cleanup

# Method 2: Using Helm
helm uninstall gestor-backend -n gestor-backend

# Method 3: Manual cleanup
kubectl delete namespace gestor-backend
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [MinIO Documentation](https://docs.min.io/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Check Kubernetes events
4. Verify configuration files
5. Open an issue in the repository

---

**Note:** This deployment guide assumes a basic understanding of Kubernetes concepts. For production deployments, consider consulting with your DevOps team or Kubernetes experts.
