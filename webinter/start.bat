@echo off
echo Starting Internship Management System...
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server on http://127.0.0.1:3000
start "Backend Server" cmd /k "cd /d %~dp0server && node index.js"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Frontend Client
echo [2/2] Starting Frontend Client on http://localhost:5173
start "Frontend Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo   Backend:  http://127.0.0.1:3000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
