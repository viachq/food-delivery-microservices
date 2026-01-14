@echo off
chcp 65001 >nul
REM Script for quick deployment of all Kubernetes resources (Windows)

echo Deploying Food Delivery Microservices to Kubernetes...

REM Check if Docker is running
echo Checking Docker Desktop...
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker Desktop is not running!
    echo.
    echo Please:
    echo    1. Start Docker Desktop
    echo    2. Wait for it to fully start
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)
echo Docker Desktop is running

REM Check if kubectl is available
where kubectl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: kubectl not found. Please install kubectl first.
    pause
    exit /b 1
)

REM Check and set kubectl context if needed
echo Checking kubectl configuration...

REM Get current context
for /f "tokens=*" %%i in ('kubectl config current-context 2^>nul') do set CURRENT_CTX=%%i

if "%CURRENT_CTX%"=="" (
    echo No kubectl context found. Trying to set docker-desktop context...
    kubectl config use-context docker-desktop >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo Switched to docker-desktop context
    )
) else (
    echo Current context: %CURRENT_CTX%
    
    REM If current context is minikube, prefer docker-desktop if Docker Desktop is running
    if /i "%CURRENT_CTX%"=="minikube" (
        echo Detected minikube context. Checking if docker-desktop is available...
        kubectl config use-context docker-desktop >nul 2>&1
        kubectl cluster-info >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            kubectl get nodes >nul 2>&1
            if %ERRORLEVEL% EQU 0 (
                echo Switched from minikube to docker-desktop context (Docker Desktop Kubernetes is active)
                goto context_set
            )
        )
        REM If docker-desktop doesn't work, switch back to minikube
        kubectl config use-context minikube >nul 2>&1
        echo Using minikube context (docker-desktop not available)
    )
    
    REM Try to connect with current context
    kubectl cluster-info >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo Context '%CURRENT_CTX%' is not accessible.
        echo.
        echo Trying to find available context...
        
        REM Try docker-desktop first (most common for Docker Desktop)
        echo Trying docker-desktop context...
        kubectl config use-context docker-desktop >nul 2>&1
        kubectl cluster-info >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            kubectl get nodes >nul 2>&1
            if %ERRORLEVEL% EQU 0 (
                echo Successfully switched to docker-desktop context
                goto context_set
            )
        )
        
        REM If docker-desktop didn't work, try minikube
        echo Trying minikube context...
        kubectl config use-context minikube >nul 2>&1
        kubectl cluster-info >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            kubectl get nodes >nul 2>&1
            if %ERRORLEVEL% EQU 0 (
                echo Successfully switched to minikube context
                goto context_set
            )
        )
        
        REM If still no accessible context
        echo.
        echo ERROR: No accessible Kubernetes context found!
        echo.
        echo Available contexts:
        kubectl config get-contexts 2>&1
        echo.
        echo Please ensure one of the following:
        echo    1. Docker Desktop Kubernetes is enabled and running
        echo    2. Minikube is started (minikube start)
        echo    3. Or manually set context: kubectl config use-context ^<context-name^>
        echo.
        pause
        exit /b 1
    ) else (
        REM Verify nodes are accessible too
        kubectl get nodes >nul 2>&1
        if %ERRORLEVEL% NEQ 0 (
            echo Context '%CURRENT_CTX%' cluster-info works but nodes are not ready yet.
            echo This might be normal during cluster startup.
        ) else (
            echo Context '%CURRENT_CTX%' is accessible
        )
    )
)

:context_set
echo.
echo Using context: 
kubectl config current-context 2>&1
echo.

REM Check Kubernetes cluster connection with retries
echo Checking Kubernetes cluster connection...

set MAX_RETRIES=10
set RETRY_COUNT=0
set CLUSTER_READY=0

:check_cluster
kubectl cluster-info >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    REM Additional check - verify nodes are ready
    kubectl get nodes >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        set CLUSTER_READY=1
        goto cluster_ready
    )
)

set /a RETRY_COUNT+=1
if %RETRY_COUNT% LSS %MAX_RETRIES% (
    echo Waiting for cluster to be ready... (attempt %RETRY_COUNT%/%MAX_RETRIES%)
    timeout /t 5 /nobreak >nul
    goto check_cluster
)

REM If we get here, cluster is not ready
echo.
echo ERROR: Cannot connect to Kubernetes cluster after %MAX_RETRIES% attempts!
echo.
echo Diagnostic information:
echo.
echo Current context:
kubectl config current-context 2>&1
echo.
echo Cluster info error:
kubectl cluster-info 2>&1
echo.
echo Available contexts:
kubectl config get-contexts 2>&1
echo.
echo Troubleshooting:
echo.
echo If Kubernetes shows "Active" in Docker Desktop but kubectl cannot connect:
echo    1. Wait 2-3 more minutes - cluster may still be initializing
echo    2. Try restarting Docker Desktop completely
echo    3. Check if kubectl context is correct: kubectl config get-contexts
echo    4. Set context manually: kubectl config use-context docker-desktop
echo    5. Verify Docker Desktop Kubernetes is fully started (green indicator)
echo.
echo To enable Kubernetes in Docker Desktop:
echo    1. Open Docker Desktop
echo    2. Go to Settings ^> Kubernetes
echo    3. Turn ON "Enable Kubernetes" toggle
echo    4. Click "Apply" button
echo    5. Wait 2-3 minutes for full startup
echo.
pause
exit /b 1

:cluster_ready
echo Kubernetes cluster is accessible
echo.

REM Check if Docker images exist
echo Checking Docker images...
set IMAGES_MISSING=0
docker images auth-service:latest --format "{{.Repository}}:{{.Tag}}" | findstr /C:"auth-service:latest" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: auth-service:latest image not found
    set IMAGES_MISSING=1
)
docker images catalog-service:latest --format "{{.Repository}}:{{.Tag}}" | findstr /C:"catalog-service:latest" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: catalog-service:latest image not found
    set IMAGES_MISSING=1
)
docker images order-service:latest --format "{{.Repository}}:{{.Tag}}" | findstr /C:"order-service:latest" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: order-service:latest image not found
    set IMAGES_MISSING=1
)
docker images client-frontend:latest --format "{{.Repository}}:{{.Tag}}" | findstr /C:"client-frontend:latest" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: client-frontend:latest image not found
    set IMAGES_MISSING=1
)
docker images admin-frontend:latest --format "{{.Repository}}:{{.Tag}}" | findstr /C:"admin-frontend:latest" >nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: admin-frontend:latest image not found
    set IMAGES_MISSING=1
)

if %IMAGES_MISSING% EQU 1 (
    echo.
    echo IMPORTANT: Some Docker images are missing!
    echo.
    echo Before deploying to Kubernetes, you need to build Docker images:
    echo.
    echo     docker build -t auth-service:latest ../services/auth-service
    echo     docker build -t catalog-service:latest ../services/catalog-service
    echo     docker build -t order-service:latest ../services/order-service
    echo     docker build -t client-frontend:latest ../client
    echo     docker build -t admin-frontend:latest ../admin
    echo.
    echo Or use docker-compose to build all images:
    echo     docker-compose build
    echo.
    echo Continue deployment anyway? (Y/N)
    set /p CONTINUE=
    if /i not "%CONTINUE%"=="Y" (
        echo Deployment cancelled.
        pause
        exit /b 0
    )
    echo.
    echo Continuing deployment... Pods may fail to start without images.
    echo.
)

REM Create namespace
echo Creating namespace...
kubectl apply -f namespace.yaml

REM Apply ConfigMap and Secret
echo Applying ConfigMap and Secret...
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

REM Deploy backend services
echo Deploying backend services...
kubectl apply -f auth-service\
kubectl apply -f catalog-service\
kubectl apply -f order-service\

REM Deploy frontend services
echo Deploying frontend services...
kubectl apply -f client-frontend\
kubectl apply -f admin-frontend\

REM Apply Ingress (if needed)
if "%1"=="--with-ingress" (
    echo Applying Ingress...
    kubectl apply -f ingress.yaml
)

REM Show status
echo.
echo Deployment complete!
echo.
echo Status:
kubectl get pods -n food-delivery
echo.
echo Services:
kubectl get svc -n food-delivery
echo.
echo To access services, use port-forwarding:
echo    kubectl port-forward svc/auth-service 8001:8001 -n food-delivery
echo    kubectl port-forward svc/catalog-service 8002:8002 -n food-delivery
echo    kubectl port-forward svc/order-service 8003:8003 -n food-delivery
echo    kubectl port-forward svc/client-frontend 5174:5174 -n food-delivery
echo    kubectl port-forward svc/admin-frontend 5173:5173 -n food-delivery
echo.
pause
