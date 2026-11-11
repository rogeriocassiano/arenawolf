[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [ValidateSet('Check', 'Enable', 'Restore')][string]$Mode = 'Check',
    [string]$ExpectedComputerName,
    [string]$TargetUser,
    [string]$AgentPath,
    [bool]$BlockUninstall = $true,
    [string[]]$GameFolders = @()
)

$ErrorActionPreference = 'Stop'
$adminGroup = @(Get-LocalGroupMember -SID 'S-1-5-32-544')
$adminSids = @($adminGroup | ForEach-Object { $_.SID.Value })
$users = @(Get-LocalUser | Where-Object { $_.Enabled })
if ($Mode -eq 'Check') {
    Write-Output "Computador: $env:COMPUTERNAME"
    $users | Select-Object Name, @{Name='Administrator';Expression={ $adminSids -contains $_.SID.Value }} | Format-Table -AutoSize
    Write-Output 'Somente verificacao: nenhuma configuracao foi alterada.'
    return
}
if (!$ExpectedComputerName -or $ExpectedComputerName -ine $env:COMPUTERNAME) { throw 'Informe o nome EXATO da maquina 09 em ExpectedComputerName. Nenhuma alteracao aplicada.' }
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Execute na conta de manutencao, como administrador.' }
if (!$TargetUser) { throw 'Informe a conta local dos clientes em TargetUser.' }
$target = Get-LocalUser -Name $TargetUser
$sid = $target.SID.Value
if ($sid -eq $identity.User.Value) { throw 'A conta de manutencao nao pode ser a conta alvo.' }
if (!$target.Enabled) { throw 'A conta alvo esta desativada.' }
if ($Mode -eq 'Enable' -and $adminSids -contains $sid) { throw 'Use uma conta PADRAO para clientes, nao uma conta administrativa.' }
$backupAdmins = @($users | Where-Object { $_.SID.Value -ne $sid -and $adminSids -contains $_.SID.Value })
if ($backupAdmins.Count -eq 0) { throw 'Mantenha uma conta administrativa separada e habilitada.' }
$profile = Get-CimInstance Win32_UserProfile | Where-Object { $_.SID -eq $sid } | Select-Object -First 1
if (!$profile) { throw 'Entre uma vez na conta dos clientes e instale o agente nela antes de configurar.' }
$backupFile = Join-Path $env:ProgramData "ArenaWolf\ShellBackup\$sid.json"
if ($Mode -eq 'Enable') {
    $windows = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion'
    if ($windows.EditionID -notlike 'Professional*' -or [int]$windows.CurrentBuildNumber -lt 19041) { throw 'Este procedimento foi preparado para Windows Pro build 19041 ou superior.' }
    if (!$AgentPath -or ![IO.Path]::IsPathRooted($AgentPath) -or $AgentPath.StartsWith('\\')) { throw 'Informe o caminho LOCAL completo do Arena Wolf Agent.exe em AgentPath.' }
    foreach ($folder in $GameFolders) {
        if (![IO.Path]::IsPathRooted($folder) -or $folder.StartsWith('\\') -or !(Test-Path -LiteralPath $folder)) { throw "Pasta de jogo invalida: $folder" }
    }
    $agent = Get-Item -LiteralPath $AgentPath
    if ($agent.Name -ne 'Arena Wolf Agent.exe' -or [version]$agent.VersionInfo.ProductVersion -lt [version]'1.0.3') { throw 'Instale o Arena Wolf Agent 1.0.3 ou superior antes de habilitar.' }
    $AgentPath = $agent.FullName
} else {
    if (!(Test-Path -LiteralPath $backupFile)) { throw 'Backup de recuperacao nao encontrado. Nenhuma alteracao aplicada.' }
}
if (!$PSCmdlet.ShouldProcess("$env:COMPUTERNAME / $TargetUser / $sid", "$Mode interface inicial da Arena e entradas de inicializacao desse agente")) { return }
$hive = "Registry::HKEY_USERS\$sid"
$loadedHere = $false
try {
    if (!(Test-Path $hive)) {
        & reg.exe load "HKU\$sid" (Join-Path $profile.LocalPath 'NTUSER.DAT') | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel carregar o perfil alvo.' }
        $loadedHere = $true
    }
    $systemPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Policies\System"
    $runPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Run"
    if ($Mode -eq 'Enable') {
        if (!(Test-Path -LiteralPath $backupFile)) {
            $shell = (Get-ItemProperty -Path $systemPath -Name Shell -ErrorAction SilentlyContinue).Shell
            $entries = @()
            if (Test-Path $runPath) {
                $run = Get-Item $runPath
                foreach ($name in $run.GetValueNames()) {
                    $value = $run.GetValue($name)
                    if ($value -is [string] -and $value.IndexOf($AgentPath, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                        $entries += @{ Name = $name; Value = $value; Kind = $run.GetValueKind($name).ToString() }
                    }
                }
                $run.Close()
            }
            $programsPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Policies\Programs"
            $explorerPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer"
            $backup = @{
                Computer = $env:COMPUTERNAME; SID = $sid; Shell = $shell; RunEntries = $entries
                NoProgramsAndFeatures = (Get-ItemProperty -Path $programsPath -Name NoProgramsAndFeatures -ErrorAction SilentlyContinue).NoProgramsAndFeatures
                NoControlPanel = (Get-ItemProperty -Path $explorerPath -Name NoControlPanel -ErrorAction SilentlyContinue).NoControlPanel
                BlockUninstall = $BlockUninstall; GameFolders = $GameFolders
            }
            New-Item -ItemType Directory -Path (Split-Path $backupFile) -Force | Out-Null
            $backup | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $backupFile -Encoding UTF8
        }
        $saved = Get-Content -LiteralPath $backupFile -Raw | ConvertFrom-Json
        if ($saved.Computer -ine $env:COMPUTERNAME -or $saved.SID -ne $sid) { throw 'Backup pertence a outra conta ou computador.' }
        if (!(Test-Path $systemPath)) { New-Item -Path $systemPath | Out-Null }
        New-ItemProperty -Path $systemPath -Name Shell -Value ('"' + $AgentPath + '" --client-shell') -PropertyType String -Force | Out-Null
        foreach ($entry in $saved.RunEntries) { Remove-ItemProperty -Path $runPath -Name $entry.Name -ErrorAction SilentlyContinue }
        if ($saved.BlockUninstall) {
            $programsPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Policies\Programs"
            $explorerPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer"
            if (!(Test-Path $programsPath)) { New-Item -Path $programsPath | Out-Null }
            if (!(Test-Path $explorerPath)) { New-Item -Path $explorerPath | Out-Null }
            New-ItemProperty -Path $programsPath -Name NoProgramsAndFeatures -Value 1 -PropertyType DWord -Force | Out-Null
            New-ItemProperty -Path $explorerPath -Name NoControlPanel -Value 1 -PropertyType DWord -Force | Out-Null
        }
        foreach ($folder in @($saved.GameFolders)) {
            & icacls.exe "$folder" /deny "*$sid`:(OI)(CI)(DE,DC)" /Q | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "Falha ao proteger pasta: $folder" }
        }
        Write-Output 'Interface configurada apenas para a conta dos clientes. Nao houve reinicio nem encerramento de programas.'
    } else {
        $saved = Get-Content -LiteralPath $backupFile -Raw | ConvertFrom-Json
        if ($saved.Computer -ine $env:COMPUTERNAME -or $saved.SID -ne $sid) { throw 'Backup pertence a outra conta ou computador.' }
        if ($null -ne $saved.Shell) {
            if (!(Test-Path $systemPath)) { New-Item -Path $systemPath | Out-Null }
            New-ItemProperty -Path $systemPath -Name Shell -Value $saved.Shell -PropertyType String -Force | Out-Null
        } else { Remove-ItemProperty -Path $systemPath -Name Shell -ErrorAction SilentlyContinue }
        if (@($saved.RunEntries).Count -gt 0 -and !(Test-Path $runPath)) { New-Item -Path $runPath | Out-Null }
        foreach ($entry in $saved.RunEntries) { New-ItemProperty -Path $runPath -Name $entry.Name -Value $entry.Value -PropertyType $entry.Kind -Force | Out-Null }
        $programsPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Policies\Programs"
        $explorerPath = "$hive\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer"
        if ($null -ne $saved.NoProgramsAndFeatures) {
            New-ItemProperty -Path $programsPath -Name NoProgramsAndFeatures -Value $saved.NoProgramsAndFeatures -PropertyType DWord -Force | Out-Null
        } else { Remove-ItemProperty -Path $programsPath -Name NoProgramsAndFeatures -ErrorAction SilentlyContinue }
        if ($null -ne $saved.NoControlPanel) {
            New-ItemProperty -Path $explorerPath -Name NoControlPanel -Value $saved.NoControlPanel -PropertyType DWord -Force | Out-Null
        } else { Remove-ItemProperty -Path $explorerPath -Name NoControlPanel -ErrorAction SilentlyContinue }
        foreach ($folder in @($saved.GameFolders)) {
            & icacls.exe "$folder" /remove:d "*$sid" /Q | Out-Null
        }
        Write-Output 'Interface anterior restaurada. O backup foi preservado. Nao houve reinicio automatico.'
    }
    Write-Output "Backup: $backupFile"
    Write-Output 'A mudanca vale no proximo login dessa conta. Mantenha a conta administrativa disponivel.'
} finally {
    if ($loadedHere) {
        [GC]::Collect()
        [GC]::WaitForPendingFinalizers()
        & reg.exe unload "HKU\$sid" | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Warning 'O perfil continua carregado. Nao force o descarregamento; confira na manutencao.' }
    }
}
