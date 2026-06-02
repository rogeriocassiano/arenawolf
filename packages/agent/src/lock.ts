import { exec } from "child_process";

/**
 * Bloqueia a tela do Windows (equivalente a Win+L)
 */
export function lockScreen(): void {
  if (process.platform !== "win32") {
    console.log("[lock] Simulando bloqueio (não-Windows)");
    return;
  }
  exec("rundll32.exe user32.dll,LockWorkStation", (err) => {
    if (err) console.error("[lock] Erro ao bloquear tela:", err.message);
  });
}

/**
 * Desabilita atalhos de teclado do sistema (kiosk mode parcial)
 * Requer permissão de administrador no Windows
 */
export function disableSystemKeys(): void {
  if (process.platform !== "win32") return;
  // Desabilitar Task Manager via registro
  exec(
    'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f',
    () => {}
  );
}

export function enableSystemKeys(): void {
  if (process.platform !== "win32") return;
  exec(
    'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v DisableTaskMgr /f',
    () => {}
  );
}
