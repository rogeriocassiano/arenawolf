@echo off
chcp 65001 >nul
REM Arena Wolf Agent - Instalador Rápido (Batch)
REM Uso: deploy.bat "wolf-pc-01" "https://..." "eyJ..."

echo.
echo  ================================================
echo    ARENA WOLF AGENT - INSTALADOR RAPIDO v1.0
echo  ================================================
echo.

REM Verificar admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Execute como Administrador!
    echo Botao direito no arquivo -^> Executar como administrador
    pause
    exit /b 1
)

REM Verificar argumentos
if "%~3"=="" (
    echo Uso: deploy.bat "machine-id" "supabase-url" "supabase-key"
    echo.
    echo Exemplo:
    echo   deploy.bat "wolf-pc-01" "https://abc123.supabase.co" "eyJhbG..."
    pause
    exit /b 1
)

set MACHINE_ID=%~1
set SUPABASE_URL=%~2
set SUPABASE_KEY=%~3
set API_URL=https://arenawdolf.netlify.app

echo [INFO] ID da Maquina: %MACHINE_ID%
echo [INFO] URL Supabase: %SUPABASE_URL%
echo.

REM Criar diretorio temp
set TEMP_DIR=%TEMP%\ArenaWolfSetup
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM Download via PowerShell
echo [1/5] Baixando instalador...
powershell -Command "try { Invoke-WebRequest -Uri 'https://github.com/rogeriocassiano/arenawolf/releases/download/v1.0.0/Arena.Wolf.Agent.Setup.1.0.0.exe' -OutFile '%TEMP_DIR%\setup.exe' -UseBasicParsing } catch { exit 1 }"

if not exist "%TEMP_DIR%\setup.exe" (
    echo [ERRO] Falha no download!
    pause
    exit /b 1
)

echo [OK] Download concluido
echo.

REM Encerrar processo existente
echo [2/5] Verificando instalacao existente...
taskkill /f /im "Arena Wolf Agent.exe" 2>nul
timeout /t 2 /nobreak >nul

REM Instalacao silenciosa
echo [3/5] Instalando...
"%TEMP_DIR%\setup.exe" /S
if %errorLevel% neq 0 (
    echo [ERRO] Instalacao falhou!
    pause
    exit /b 1
)
echo [OK] Instalacao concluida

REM Configuracao
echo [4/5] Configurando...
set CONFIG_DIR=%APPDATA%\arena-wolf-agent
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

(
echo {
echo   "machineId": "%MACHINE_ID%",
echo   "supabaseUrl": "%SUPABASE_URL%",
echo   "supabaseKey": "%SUPABASE_KEY%",
echo   "apiBaseUrl": "%API_URL%",
echo   "version": "1.0.0"
echo }
) > "%CONFIG_DIR%\config.json"

echo [OK] Configuracao salva

REM Atalho na inicializacao
echo [5/5] Configurando inicializacao automatica...
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
copy "%CONFIG_DIR%\..\..\..\..\..\Program Files\Arena Wolf Agent\Arena Wolf Agent.exe" "%STARTUP%\Arena Wolf Agent.exe" 2>nul

REM Iniciar
echo [INFO] Iniciando agente...
start "" "C:\Program Files\Arena Wolf Agent\Arena Wolf Agent.exe"
timeout /t 3 /nobreak >nul

REM Limpeza
rmdir /s /q "%TEMP_DIR%" 2>nul

echo.
echo ================================================
echo    INSTALACAO CONCLUIDA!
echo ================================================
echo.
echo Maquina: %MACHINE_ID%
echo.
echo Proximos passos:
echo   1. Reinicie o PC para testar
echo   2. Verifique tela de bloqueio
echo   3. Teste login com usuario
echo.

choice /c SN /n /m "Deseja reiniciar agora? (S=Sim, N=Nao) "
if %errorLevel% equ 1 shutdown /r /t 5 /c "Reiniciando apos instalacao Arena Wolf Agent"

exit /b 0
