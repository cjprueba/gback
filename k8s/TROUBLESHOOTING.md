# Troubleshooting Guide - Gestor Backend Deployment

## 🚨 Current Issue: Permission Denied

You're getting permission errors because your Kubernetes user `lfuentes` doesn't have the necessary permissions.

## 🔧 Solutions (Try in Order)

### Solution 1: Use Default Namespace (Recommended - Easiest)

Deploy to the default namespace where you likely have permissions:

```powershell
cd k8s
.\deploy-simple.ps1 deploy
```

This approach:
- ✅ Uses default namespace (no namespace creation needed)
- ✅ Avoids RBAC permission issues
- ✅ Deploys PostgreSQL, MinIO, and application
- ✅ No Docker build required

### Solution 2: Setup RBAC Permissions

If you want to use a dedicated namespace:

```powershell
cd k8s
.\deploy-with-rbac.ps1 deploy
```

This will:
- ✅ Create necessary RBAC roles
- ✅ Grant permissions to your user
- ✅ Deploy in dedicated namespace

### Solution 3: Manual RBAC Setup

If the automated RBAC setup fails:

```powershell
# Apply cluster-level permissions first
kubectl apply -f cluster-rbac.yaml

# Create namespace
kubectl apply -f namespace.yaml

# Apply namespace-level permissions
kubectl apply -f rbac.yaml

# Then deploy normally
.\deploy-infrastructure.ps1 deploy
```

### Solution 4: Ask Cluster Administrator

If you're on a managed cluster (OpenShift, GKE, EKS, etc.):

1. **Contact your cluster administrator**
2. **Request these permissions**:
   ```yaml
   - apiGroups: [""]
     resources: ["namespaces", "pods", "services", "persistentvolumeclaims", "secrets"]
     verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
   - apiGroups: ["apps"]
     resources: ["deployments", "replicasets"]
     verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
   ```

## 🔍 Diagnostic Commands

### Check Your Current Permissions
```powershell
# Check who you are
kubectl whoami

# Check your permissions
kubectl auth can-i create namespaces
kubectl auth can-i create deployments
kubectl auth can-i create services
kubectl auth can-i create persistentvolumeclaims

# Check your current context
kubectl config current-context
kubectl config view --minify
```

### Check Cluster Status
```powershell
# Check cluster info
kubectl cluster-info

# Check nodes
kubectl get nodes

# Check if you can list resources
kubectl get pods
kubectl get services
kubectl get deployments
```

### Check Namespace Access
```powershell
# List namespaces you can access
kubectl get namespaces

# Try to create a test namespace
kubectl create namespace test-namespace
kubectl delete namespace test-namespace
```

## 🎯 Quick Fix Commands

### If you have admin access:
```powershell
# Grant yourself admin permissions (if you have cluster-admin)
kubectl create clusterrolebinding lfuentes-admin --clusterrole=cluster-admin --user=lfuentes
```

### If you're using minikube:
```powershell
# Start minikube with admin permissions
minikube start --driver=docker
```

### If you're using kind:
```powershell
# Create cluster with admin permissions
kind create cluster --name gestor-cluster
```

## 📋 Deployment Options Summary

| Option | Command | Pros | Cons |
|--------|---------|------|------|
| **Default Namespace** | `.\deploy-simple.ps1 deploy` | ✅ No permissions needed | ⚠️ Uses default namespace |
| **RBAC Setup** | `.\deploy-with-rbac.ps1 deploy` | ✅ Proper isolation | ⚠️ Requires cluster permissions |
| **Manual RBAC** | Manual steps above | ✅ Full control | ⚠️ Complex setup |
| **Admin Help** | Contact administrator | ✅ Professional setup | ⚠️ Requires external help |

## 🚀 Recommended Next Steps

1. **Try Solution 1 first** (Default namespace) - it's the safest
2. **If that works**, you can later move to a dedicated namespace
3. **If you need the dedicated namespace**, work with your cluster admin

## 🌐 Accessing Your Deployment

### After successful deployment:

**PostgreSQL:**
```powershell
kubectl port-forward service/postgresql 5432:5432
```

**MinIO Console:**
```powershell
kubectl port-forward service/minio-service 9001:9001
# Visit: http://localhost:9001
# Login: minioadmin / minioadmin
```

**Application:**
```powershell
kubectl port-forward service/gestor-backend-service 8080:80
# Visit: http://localhost:8080
```

## 🆘 Still Having Issues?

1. **Check your cluster type** (minikube, kind, cloud provider)
2. **Verify kubectl configuration**
3. **Try a different cluster** (minikube is usually the easiest)
4. **Contact your system administrator**

The default namespace approach should work in most environments!
