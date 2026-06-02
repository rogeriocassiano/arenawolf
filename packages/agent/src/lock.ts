import { exec } from "child_process";

const IS_WIN = process.platform === "win32";

/**
 * Aplica restrições máximas de kiosk mode via registro do Windows.
 * Bloqueia: Task Manager, Win+D, Win+L, Win+Tab, Alt+F4 via política,
 * e desabilita o shell explorer enquanto o agente está ativo.
 */
export function disableSystemKeys(): void {
  if (!IS_WIN) return;

  const cmds = [
    // Desabilitar Task Manager (Ctrl+Shift+Esc / Ctrl+Alt+Del → Gerenciador)
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f',
    // Desabilitar bloqueio de tela (Win+L)
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v DisableLockWorkstation /t REG_DWORD /d 1 /f',
    // Desabilitar acesso ao Painel de Controle e Configurações
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoControlPanel /t REG_DWORD /d 1 /f',
    // Desabilitar menu de contexto na área de trabalho (botão direito)
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoViewContextMenu /t REG_DWORD /d 1 /f',
    // Desabilitar Run (Win+R)
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoRun /t REG_DWORD /d 1 /f',
    // Desabilitar acesso às propriedades do Taskbar
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoSetTaskbar /t REG_DWORD /d 1 /f',
    // Desabilitar Win+D (mostrar área de trabalho)
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoDesktop /t REG_DWORD /d 1 /f',
    // Desabilitar Alt+F4 no explorer (não impede em apps — tratado no main.ts)
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoClose /t REG_DWORD /d 1 /f',
  ];

  cmds.forEach(cmd => exec(cmd, () => {}));
}

export function enableSystemKeys(): void {
  if (!IS_WIN) return;

  const cmds = [
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v DisableTaskMgr /f',
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v DisableLockWorkstation /f',
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoControlPanel /f',
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoViewContextMenu /f',
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoRun /f',
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoSetTaskbar /f',
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoDesktop /f',
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoClose /f',
  ];

  cmds.forEach(cmd => exec(cmd, () => {}));
}

/**
 * Mantido para compatibilidade — não usa LockWorkStation pois
 * DisableLockWorkstation está ativo enquanto o agente controla o PC.
 */
export function lockScreen(): void {
  if (!IS_WIN) {
    console.log("[lock] Simulando bloqueio (não-Windows)");
    return;
  }
  // Com DisableLockWorkstation ativo, usamos nossa própria tela de lock
  // (a janela kiosk do Electron). Nada a fazer aqui — o main.ts chama showLockedState().
}
