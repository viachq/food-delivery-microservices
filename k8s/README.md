# Kubernetes Deployment Guide

Цей каталог містить Kubernetes manifests для розгортання Food Delivery Microservices.

## Структура

```
k8s/
├── namespace.yaml              # Namespace для всіх ресурсів
├── configmap.yaml              # Конфігурація (нечутливі дані)
├── secret.yaml                 # Секрети (JWT, Telegram токени)
├── ingress.yaml                # Ingress для доступу до сервісів
├── auth-service/
│   ├── deployment.yaml         # Deployment (2 replicas)
│   └── service.yaml            # Service (ClusterIP)
├── catalog-service/
│   ├── deployment.yaml
│   └── service.yaml
├── order-service/
│   ├── deployment.yaml
│   └── service.yaml
├── client-frontend/
│   ├── deployment.yaml
│   └── service.yaml
└── admin-frontend/
    ├── deployment.yaml
    └── service.yaml
```

## Вимоги

- Kubernetes кластер (minikube, k3s, kind, або cloud кластер)
- kubectl встановлений та налаштований
- Docker images зібрані та доступні в registry (або локально для minikube)

## Швидкий старт

### 1. Підготовка Docker images

Для локального тестування з minikube:

```bash
# Налаштувати Docker для minikube
eval $(minikube docker-env)

# Зібрати images
docker build -t auth-service:latest ./services/auth-service
docker build -t catalog-service:latest ./services/catalog-service
docker build -t order-service:latest ./services/order-service
docker build -t client-frontend:latest ./client
docker build -t admin-frontend:latest ./admin
```

Або використати registry:

```bash
# Push images до registry
docker tag auth-service:latest your-registry/auth-service:latest
docker push your-registry/auth-service:latest

# Оновити image names в deployment.yaml
```

### 2. Застосування manifests

```bash
# Створити namespace
kubectl apply -f k8s/namespace.yaml

# Застосувати конфігурацію та секрети
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Застосувати backend сервіси
kubectl apply -f k8s/auth-service/
kubectl apply -f k8s/catalog-service/
kubectl apply -f k8s/order-service/

# Застосувати frontend сервіси
kubectl apply -f k8s/client-frontend/
kubectl apply -f k8s/admin-frontend/

# Застосувати Ingress (якщо встановлений ingress controller)
kubectl apply -f k8s/ingress.yaml
```

### 3. Перевірка статусу

```bash
# Перевірити pods
kubectl get pods -n food-delivery

# Перевірити services
kubectl get svc -n food-delivery

# Перевірити deployments
kubectl get deployments -n food-delivery

# Перевірити logs
kubectl logs -f deployment/auth-service -n food-delivery
```

### 4. Доступ до сервісів

#### Варіант 1: Port Forwarding (для тестування)

```bash
# Auth Service
kubectl port-forward svc/auth-service 8001:8001 -n food-delivery

# Catalog Service
kubectl port-forward svc/catalog-service 8002:8002 -n food-delivery

# Order Service
kubectl port-forward svc/order-service 8003:8003 -n food-delivery

# Client Frontend
kubectl port-forward svc/client-frontend 5174:5174 -n food-delivery

# Admin Frontend
kubectl port-forward svc/admin-frontend 5173:5173 -n food-delivery
```

#### Варіант 2: Ingress (потрібен ingress controller)

```bash
# Встановити NGINX Ingress Controller (для minikube)
minikube addons enable ingress

# Додати записи в /etc/hosts (або C:\Windows\System32\drivers\etc\hosts)
# Отримати IP minikube:
minikube ip

# Додати:
# <minikube-ip> food-delivery.local
# <minikube-ip> admin.food-delivery.local
# <minikube-ip> api.food-delivery.local
```

#### Варіант 3: NodePort (альтернатива Ingress)

Змініть тип Service на NodePort в service.yaml файлах:

```yaml
spec:
  type: NodePort
  ports:
  - port: 8001
    nodePort: 30001  # Доступний на <node-ip>:30001
```

## Компоненти

### Deployment

Кожен сервіс має:
- **2 replicas** (мінімальна вимога)
- **Health checks**: liveness та readiness probes
- **Resource limits**: CPU та пам'ять
- **Environment variables**: з ConfigMap та Secret

### Service

- **Type**: ClusterIP (внутрішній доступ)
- **Ports**: відповідають портам з docker-compose

### ConfigMap

Містить нечутливі конфігурації:
- Service URLs для міжсервісної комунікації
- Database paths
- JWT algorithm та expires
- Telegram settings (не токени)

### Secret

Містить чутливі дані:
- JWT_SECRET_KEY
- TELEGRAM_BOT_TOKEN

**Важливо**: Для production змініть значення в secret.yaml!

### Ingress

Налаштований для:
- `food-delivery.local` → client-frontend
- `admin.food-delivery.local` → admin-frontend
- `api.food-delivery.local` → backend services

## Production рекомендації

### 1. Persistent Volumes для БД

Замініть `emptyDir` на PersistentVolumeClaim:

```yaml
# Створити PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: auth-db-pvc
  namespace: food-delivery
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### 2. Оновлення Secret

```bash
# Створити secret з файлу
kubectl create secret generic food-delivery-secrets \
  --from-file=JWT_SECRET_KEY=./secrets/jwt-key.txt \
  --from-file=TELEGRAM_BOT_TOKEN=./secrets/telegram-token.txt \
  -n food-delivery
```

### 3. Resource Requests/Limits

Налаштуйте відповідно до навантаження.

### 4. Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: food-delivery
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Видалення

```bash
# Видалити всі ресурси
kubectl delete namespace food-delivery

# Або окремо
kubectl delete -f k8s/
```

## Troubleshooting

### Pods не запускаються

```bash
# Перевірити події
kubectl get events -n food-delivery --sort-by='.lastTimestamp'

# Перевірити logs
kubectl logs <pod-name> -n food-delivery

# Опис pod
kubectl describe pod <pod-name> -n food-delivery
```

### Images не знайдено

```bash
# Перевірити чи image існує
docker images | grep auth-service

# Для minikube
eval $(minikube docker-env)
docker images | grep auth-service
```

### Service недоступний

```bash
# Перевірити endpoints
kubectl get endpoints -n food-delivery

# Перевірити service
kubectl describe svc auth-service -n food-delivery
```

## Додаткові ресурси

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Guide](https://minikube.sigs.k8s.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
