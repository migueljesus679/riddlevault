@echo off
echo Iniciando Digicores Backend...
cd /d "%~dp0backend"
node --experimental-sqlite src/server.js
