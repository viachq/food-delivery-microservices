@echo off
cls
echo.
echo ============================================
echo  Starting Food Delivery Microservices
echo ============================================
echo.

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%

echo [*] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

echo [*] Stopping old processes (if any)...
taskkill /IM python.exe /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1
timeout /t 1 /nobreak >nul

echo.
echo [1/5] Starting Auth Service (port 8001)...
start "Auth Service" cmd /k "cd /d %PROJECT_ROOT%services\auth-service && set PYTHONPATH=%PROJECT_ROOT%services\auth-service && python -m uvicorn backend.main:app --reload --port 8001 --host 0.0.0.0"
timeout /t 2 /nobreak >nul

echo [2/5] Starting Catalog Service (port 8002)...
start "Catalog Service" cmd /k "cd /d %PROJECT_ROOT%services\catalog-service && set PYTHONPATH=%PROJECT_ROOT%services\catalog-service && python -m uvicorn backend.main:app --reload --port 8002 --host 0.0.0.0"
timeout /t 2 /nobreak >nul

echo [3/5] Starting Order Service (port 8003)...
start "Order Service" cmd /k "cd /d %PROJECT_ROOT%services\order-service && set PYTHONPATH=%PROJECT_ROOT%services\order-service && python -m uvicorn backend.main:app --reload --port 8003 --host 0.0.0.0"
timeout /t 2 /nobreak >nul

echo [4/5] Starting Admin Frontend (port 5173)...
start "Admin Frontend" cmd /k "cd /d %PROJECT_ROOT%admin && npm run dev"
timeout /t 1 /nobreak >nul

echo [5/5] Starting Client Frontend (port 5174)...
start "Client Frontend" cmd /k "cd /d %PROJECT_ROOT%client && npm run dev"

timeout /t 3 /nobreak >nul
cls
echo.
echo ============================================
echo   All Services Started!
echo ============================================
echo.
echo BACKEND SERVICES:
echo   - Auth Service:    http://localhost:8001 (docs: http://localhost:8001/docs)
echo   - Catalog Service: http://localhost:8002 (docs: http://localhost:8002/docs)
echo   - Order Service:   http://localhost:8003 (docs: http://localhost:8003/docs)
echo.
echo FRONTEND:
echo   - Admin Panel:     http://localhost:5173
echo   - Client App:      http://localhost:5174
echo.
echo ============================================
echo.
echo NOTE: Each service runs in a separate window.
echo       Close individual windows to stop services.
echo.
pause
