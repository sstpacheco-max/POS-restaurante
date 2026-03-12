@echo off
title Punto POS Pro - Servidor
cd /d "d:\punto POS española"
echo.
echo  =========================================
echo   Punto POS Pro
echo   Iniciando servidor con PM2...
echo  =========================================
echo.

:: Intentar detener servidor existente si habia uno
pm2 delete punto-pos 2>nul

:: Iniciar con PM2 (se mantiene activo automaticamente)
pm2 start ecosystem.config.js

echo.
echo  =========================================
echo   Servidor iniciado correctamente!
echo   Accede desde: http://localhost:3000
echo  
echo   El servidor corre en segundo plano.
echo   PUEDES CERRAR ESTA VENTANA.
echo  =========================================
echo.
timeout /t 5
