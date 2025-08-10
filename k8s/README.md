# Kubernetes Deployment for Gestor Backend

This directory contains Kubernetes manifests to deploy the Gestor Backend application as a pod.

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl CLI tool
- Docker

## Architecture

The deployment includes:
- **Gestor Backend**: Node.js Fastify application
- **PostgreSQL**: Database for the application
- **MinIO**: Object storage for file management
- **Services**: Internal communication between components
- **Ingress**: External access to the application

## Quick Start

1. **Build and Deploy**:
   ```bash
   cd k8s
   chmod +x deploy.sh
   ./deploy.sh deploy
   ```

2. **Check Status**:
   ```bash
   ./deploy.sh status
   ```

3. **View Logs**:
   ```bash
   ./deploy.sh logs
   ```

4. **Delete Deployment**:
   ```bash
   ./deploy.sh delete
   ```

## Manual Deployment

If you prefer to deploy manually:

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Apply secrets
kubectl apply -f secrets.yaml

# Deploy PostgreSQL
kubectl apply -f postgresql-deployment.yaml

# Deploy MinIO
kubectl apply -f minio-deployment.yaml

# Deploy main application
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## Configuration

### Environment Variables

The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `MINIO_ACCESS_KEY`: MinIO access key
- `MINIO_SECRET_KEY`: MinIO secret key

### Secrets

Update the `secrets.yaml` file with your actual values:

```bash
# Encode your secrets
echo -n "your-database-url" | base64
echo -n "your-jwt-secret" | base64
echo -n "your-minio-access-key" | base64
echo -n "your-minio-secret-key" | base64
```

## Accessing the Application

### Local Development (minikube)

```bash
# Enable ingress addon
minikube addons enable ingress

# Get the service URL
minikube service gestor-backend-service -n gestor-backend

# Or port forward
kubectl port-forward service/gestor-backend-service 8080:80 -n gestor-backend
```

### Production

Update the ingress host in `ingress.yaml` with your domain:

```yaml
spec:
  rules:
  - host: your-domain.com  # Change this
```

## Health Checks

The application includes:
- **Liveness Probe**: Checks if the application is running
- **Readiness Probe**: Checks if the application is ready to serve traffic
- **Startup Probe**: Gives the application time to start up

## Resource Limits

Default resource limits:
- **CPU**: 500m (0.5 cores)
- **Memory**: 512Mi

Adjust these in the deployment manifests based on your needs.

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n gestor-backend
kubectl describe pod <pod-name> -n gestor-backend
```

### Check Logs
```bash
kubectl logs <pod-name> -n gestor-backend
kubectl logs -f deployment/gestor-backend -n gestor-backend
```

### Check Services
```bash
kubectl get services -n gestor-backend
kubectl describe service <service-name> -n gestor-backend
```

### Database Connection Issues
```bash
# Check PostgreSQL pod
kubectl logs deployment/postgresql -n gestor-backend

# Test database connection
kubectl exec -it <postgresql-pod> -n gestor-backend -- psql -U admin -d postgres
```

### MinIO Issues
```bash
# Check MinIO pod
kubectl logs deployment/minio -n gestor-backend

# Access MinIO console
kubectl port-forward service/minio-service 9001:9001 -n gestor-backend
# Then visit http://localhost:9001
```

## Scaling

To scale the application:

```bash
kubectl scale deployment gestor-backend --replicas=3 -n gestor-backend
```

## Monitoring

Consider adding monitoring with:
- Prometheus for metrics
- Grafana for visualization
- Jaeger for distributed tracing

## Security Considerations

- Use proper secrets management in production
- Enable RBAC
- Use network policies
- Consider using a service mesh
- Enable TLS for ingress
