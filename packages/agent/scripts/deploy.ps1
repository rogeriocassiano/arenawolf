# Arena Wolf Agent - Script de Deploy Automatizado
# Executar como Administrador no PowerShell
# Uso: .\deploy.ps1 -MachineId "wolf-pc-XX" -SupabaseUrl "https://..." -SupabaseKey "eyJ..."

param(
    [Parameter(Mandatory=$true)]
    [string]$MachineId,
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$SupabaseKey,
    
    [string]$ApiBaseUrl = "https://arenawdolf.netlify.app",
    [string]$InstallerUrl = "https://github.com/rogeriocassiano/arenawolf/releases/download/v1.0.0/Arena.Wolf.Agent.Setup.1.0.0.exe",
    [string]$InstallPath = "C:\Program Files\Arena Wolf Agent",
    [switch]$WoLEnabled = $false,
    [string]$WoLKey = ""
)

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Step {
    param([string]$Message)
    Write-Host "[ARENA WOLF] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

# Banner
Write-Host @"
    ___                __        __    _____      __  __          
   /   |  ____  ____  / /__     / /   / ___/___  / /_/ /____  _____
  / /| | / __ \/ __ \/ / _ \   / /    \__ \/ _ \/ __/ __/ _ \/ ___/
 / ___ |/ /_/ / /_/ / /  __/  / /    ___/ /  __/ /_/ /_/  __/ /    
/_/  |_/ .___/ .___/_/\___/  /_/    /____/\___/\__/\__/\___/_/     
      /_/   /_/                                                    

         DEPLOY AUTOMATIZADO v1.0.0
"@ -ForegroundColor $Blue

Write-Host ""

# Verificar privilégios de admin
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Este script precisa ser executado como Administrador!"
    Write-Host "   Clique direito no PowerShell → 'Executar como administrador'"
    exit 1
}

Write-Step "Verificando sistema..."

# Verificar Windows version
$osInfo = Get-CimInstance Win32_OperatingSystem
$windowsVersion = [System.Environment]::OSVersion.Version
Write-Host "   Windows: $($osInfo.Caption) ($($osInfo.Version))"

if ($windowsVersion.Major -lt 10) {
    Write-Error "Windows 10 ou superior é necessário!"
    exit 1
}

# Verificar conectividade
Write-Step "Testando conectividade de rede..."
$hasInternet = Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet
if (-not $hasInternet) {
    Write-Warning "Sem conexão com internet. Instalação pode falhar."
} else {
    Write-Success "Conexão de rede OK"
}

# Diretório temporário
$tempDir = "$env:TEMP\ArenaWolfDeploy"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Download do instalador
Write-Step "Baixando instalador..."
$installerPath = "$tempDir\ArenaWolfAgent-Setup.exe"

try {
    Invoke-WebRequest -Uri $InstallerUrl -OutFile $installerPath -UseBasicParsing -ErrorAction Stop
    Write-Success "Download concluído ($(('{0:N2}' -f ((Get-Item $installerPath).Length / 1MB))) MB)"
} catch {
    Write-Error "Falha no download: $_"
    Write-Host "   Tentando download alternativo do GitHub..."
    # Fallback para URL alternativo
    $fallbackUrl = "https://raw.githubusercontent.com/rogeriocassiano/arenawolf/main/packages/agent/release/Arena%20Wolf%20Agent%20Setup%201.0.0.exe"
    try {
        Invoke-WebRequest -Uri $fallbackUrl -OutFile $installerPath -UseBasicParsing
        Write-Success "Download alternativo concluído"
    } catch {
        Write-Error "Falha em todos os downloads. Verifique a conexão."
        exit 1
    }
}

# Verificar/encerrar processo existente
Write-Step "Verificando instalação existente..."
$existingProcess = Get-Process "Arena Wolf Agent" -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Warning "Agente já está rodando. Encerrando..."
    Stop-Process -Name "Arena Wolf Agent" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Instalação silenciosa
Write-Step "Instalando Arena Wolf Agent..."
$installArgs = "/S /D=`"$InstallPath`""
$installProcess = Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -PassThru

if ($installProcess.ExitCode -ne 0) {
    Write-Error "Instalação falhou com código: $($installProcess.ExitCode)"
    exit 1
}
Write-Success "Instalação concluída em: $InstallPath"

# Configurar variáveis de ambiente (WoL opcional)
if ($WoLEnabled -and $WoLKey) {
    Write-Step "Configurando Wake-on-LAN..."
    [Environment]::SetEnvironmentVariable("WOL_SERVER_KEY", $WoLKey, "Machine")
    Write-Success "WoL configurado"
}

# Criar arquivo de configuração
Write-Step "Criando arquivo de configuração..."
$configPath = "$env:APPDATA\arena-wolf-agent\config.json"
$configDir = Split-Path $configPath -Parent

if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Force -Path $configDir | Out-Null
}

$config = @{
    machineId = $MachineId
    supabaseUrl = $SupabaseUrl
    supabaseKey = $SupabaseKey
    apiBaseUrl = $ApiBaseUrl
    version = "1.0.0"
    installedAt = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json -Depth 2

$config | Out-File -FilePath $configPath -Encoding UTF8
Write-Success "Configuração salva em: $configPath"

# Criar atalho na inicialização
Write-Step "Configurando inicialização automática..."
$startupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut("$startupPath\Arena Wolf Agent.lnk")
$shortcut.TargetPath = "$InstallPath\Arena Wolf Agent.exe"
$shortcut.WorkingDirectory = $InstallPath
$shortcut.Save()
Write-Success "Atalho de inicialização criado"

# Iniciar agente
Write-Step "Iniciando Arena Wolf Agent..."
Start-Process -FilePath "$InstallPath\Arena Wolf Agent.exe"
Start-Sleep -Seconds 3

# Verificar se iniciou
$process = Get-Process "Arena Wolf Agent" -ErrorAction SilentlyContinue
if ($process) {
    Write-Success "Agente iniciado com sucesso! (PID: $($process.Id))"
} else {
    Write-Warning "Não foi possível confirmar se o agente iniciou"
}

# Limpeza
Write-Step "Limpando arquivos temporários..."
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Success "Limpeza concluída"

# Resumo
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $Green
Write-Host "       INSTALAÇÃO CONCLUÍDA COM SUCESSO!              " -ForegroundColor $Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $Green
Write-Host ""
Write-Host "   Máquina:        $MachineId"
Write-Host "   Instalado em:   $InstallPath"
Write-Host "   Config:         $configPath"
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor $Yellow
Write-Host "   1. Reinicie o PC para testar a tela de bloqueio"
Write-Host "   2. Teste login com um usuário do site"
Write-Host "   3. Verifique no painel admin se a máquina aparece 'online'"
Write-Host ""
Write-Host "Suporte: https://github.com/rogeriocassiano/arenawolf/issues" -ForegroundColor $Blue
Write-Host ""

# Perguntar sobre reinício
$restart = Read-Host "Deseja reiniciar agora? (S/N)"
if ($restart -eq "S" -or $restart -eq "s") {
    Write-Host "Reiniciando em 5 segundos..."
    Start-Sleep -Seconds 5
    Restart-Computer -Force
}
