@echo off
title Dayflow HRMS Backend Stack Launcher
echo =====================================================================
echo           DAYFLOW HRMS BACKEND STACK LAUNCHER (WINDOWS)
echo =====================================================================
echo.
echo Launching all microservices in separate terminal windows...
echo.

echo [+] Launching API Gateway (Port 8080)...
start "API Gateway [8080]" /min cmd /c "cd /d C:\odoo project\Human-Resource-Management-System\backend\api-gateway && .\mvnw.cmd spring-boot:run"
timeout /t 3 /nobreak >null

echo [+] Launching Admin Employee Service (Port 8101)...
start "Admin Employee Service [8101]" /min cmd /c "cd /d C:\odoo project\Human-Resource-Management-System\backend\admin-employee-service && .\mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >null

echo [+] Launching Attendance Service (Port 8112)...
start "Attendance Service [8112]" /min cmd /c "cd /d C:\odoo project\Human-Resource-Management-System\backend\attendance-service && .\mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >null

echo [+] Launching Leave Service (Port 8113)...
start "Leave Service [8113]" /min cmd /c "cd /d C:\odoo project\Human-Resource-Management-System\backend\leave-service && .\mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >null

echo [+] Launching Payroll Service (Port 8116)...
start "Payroll Service [8116]" /min cmd /c "cd /d C:\odoo project\Human-Resource-Management-System\backend\payroll-service && .\mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >null

echo [+] Launching Reports Service (Port 8115)...
start "Reports Service [8115]" /min cmd /c "cd /d C:\odoo project\Human-Resource-Management-System\backend\reports-service && .\mvnw.cmd spring-boot:run"
timeout /t 2 /nobreak >null

echo [+] Launching Notification Service (Port 8114)...
start "Notification Service [8114]" /min cmd /c "cd /d C:\odoo project\Human-Resource-Management-System\backend\notification-service && .\mvnw.cmd spring-boot:run"

echo.
echo =====================================================================
echo [SUCCESS] All backend microservices are compiling and starting up!
echo They are running minimized in your taskbar.
echo.
echo Press any key to exit this launcher window...
echo =====================================================================
pause >null
