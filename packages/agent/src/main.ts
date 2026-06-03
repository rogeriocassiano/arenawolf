import { app, BrowserWindow, ipcMain, screen, nativeTheme, IpcMainInvokeEvent } from "electron";
import path from "path";
import { getConfig, isConfigured, setConfig } from "./config";
import { validatePin, endCurrentSession, subscribeToSession, subscribeToMachineControl, getRemainingSeconds, getCurrentSession, loginWithCredentials, fetchMachineApps } from "./session";
import { lockScreen, disableSystemKeys, enableSystemKeys } from "./lock";

nativeTheme.themeSource = "dark";

let lockWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let homeWindow: BrowserWindow | null = null;
let unsubscribeSession: (() => void) | null = null;
let unsubscribeMachineControl: (() => void) | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;

function createLockScreen() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  lockWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    fullscreen: true,
    kiosk: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  lockWindow.loadFile(path.join(__dirname, "../renderer/lock.html"));
  lockWindow.setAlwaysOnTop(true, "screen-saver");
  lockWindow.focus();

  // Impedir que Alt+F4 ou qualquer sinal feche a janela de lock
  lockWindow.on("close", (e: { preventDefault: () => void }) => { e.preventDefault(); lockWindow?.focus(); });

  // Bloquear atalhos perigosos no renderer da tela de lock
  // Reusar helper para bloquear atalhos na lock screen
  applyKioskInputBlock(lockWindow);

  disableSystemKeys();
}

function createOverlay() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 220,
    height: 175,
    x: width - 235,
    y: 16,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    resizable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  overlayWindow.loadFile(path.join(__dirname, "../renderer/overlay.html"));
  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  // Pixels transparentes passam os clicks para os apps, pixels opacos (widget) são clicáveis
  overlayWindow.setIgnoreMouseEvents(false);
}

function destroyOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
}

function destroyLockScreen() {
  if (lockWindow && !lockWindow.isDestroyed()) {
    lockWindow.removeAllListeners("close"); // remover interceptor antes de fechar
    lockWindow.close();
    lockWindow = null;
  }
  enableSystemKeys();
}

function showLockedState() {
  destroyOverlay();
  if (!lockWindow || lockWindow.isDestroyed()) {
    createLockScreen();
  }
}

function showHomeScreen(_apps: unknown[], _nickname: string, _credits: number, _endsAt: string) {
  destroyLockScreen();
  destroyHomeWindow();
  // Após fechar o lock, o Windows fica visível normalmente.
  // O overlay fica no canto superior direito com countdown + botão encerrar.
  // nickname/endsAt já estão no currentSession — o tick os usa diretamente.
  showActiveSession();
}

function applyKioskInputBlock(win: BrowserWindow) {
  win.webContents.on("before-input-event", (_event: { preventDefault: () => void }, input: { alt: boolean; meta: boolean; control: boolean; shift: boolean; key: string }) => {
    const blocked =
      (input.alt && input.key === "F4") ||
      (input.alt && input.key === "Tab") ||
      (input.meta && input.key === "d") ||
      (input.meta && input.key === "Tab") ||
      (input.meta && input.key === "r") ||
      (input.meta && input.key === "l") ||
      (input.meta && input.key === "e") ||
      (input.control && input.shift && input.key === "Escape") ||
      (input.control && input.alt && input.key === "Delete");
    if (blocked) _event.preventDefault();
  });
  win.webContents.on("context-menu", (e: { preventDefault: () => void }) => { e.preventDefault(); });
}

function createHomeWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  homeWindow = new BrowserWindow({
    width, height, x: 0, y: 0,
    frame: false, fullscreen: true,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  homeWindow.loadFile(path.join(__dirname, "../renderer/home.html"));

  // Bloquear atalhos na home igual à lock screen
  applyKioskInputBlock(homeWindow);

  // Se o usuário fechar a home por qualquer meio, voltar para lock
  homeWindow.on("close", (e: { preventDefault: () => void }) => {
    e.preventDefault();
    homeWindow?.focus();
  });
}

function destroyHomeWindow() {
  if (homeWindow && !homeWindow.isDestroyed()) {
    homeWindow.removeAllListeners("close");
    homeWindow.close();
    homeWindow = null;
  }
}

function showActiveSession() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlay();
  }
  // Iniciar tick do countdown
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  sessionCheckInterval = setInterval(() => {
    const remaining = getRemainingSeconds();
    const session = getCurrentSession();
    // creditsRemaining = minutos restantes na sessão (tempo que ainda será consumido)
    const creditsRemaining = Math.ceil(remaining / 60);
    overlayWindow?.webContents.send("tick", {
      remaining,
      session: session ? { ...session, creditsMinutes: creditsRemaining } : null,
    });
    if (remaining <= 0) {
      handleSessionExpired();
    }
  }, 1000);
}

async function handleSessionExpired() {
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  await endCurrentSession("system");
  destroyOverlay();
  destroyHomeWindow();
  showLockedState();
}

// IPC: login com email + senha (substitui PIN)
ipcMain.handle("login-credentials", async (_event: IpcMainInvokeEvent, email: string, password: string) => {
  const result = await loginWithCredentials(email, password);
  if (result.ok && result.session) {
    // Buscar apps e enviar para home
    const apps = await fetchMachineApps();
    showHomeScreen(apps, result.session.nickname, result.session.creditsMinutes, result.session.endsAt.toISOString());
    return { ok: true, nickname: result.session.nickname };
  }
  return { ok: false, error: result.error };
});

// IPC: recebido da tela de bloqueio quando usuário digita PIN (compatibilidade)
ipcMain.handle("submit-pin", async (_event: IpcMainInvokeEvent, pin: string) => {
  const cfg = getConfig();
  if (!cfg.machineId) return { ok: false, error: "Máquina não configurada" };

  const result = await validatePin(pin);
  if (result.ok && result.session) {
    const apps = await fetchMachineApps();
    showHomeScreen(apps, result.session.nickname, result.session.creditsMinutes, result.session.endsAt.toISOString());
    return { ok: true, nickname: result.session.nickname };
  }
  return { ok: false, error: result.error };
});

// IPC: buscar apps da máquina
ipcMain.handle("fetch-apps", async (_event: IpcMainInvokeEvent) => {
  return fetchMachineApps();
});

// IPC: lançar app (spawn .exe)
ipcMain.handle("launch-app", async (_event: IpcMainInvokeEvent, exePath: string, exeArgs: string) => {
  const { spawn } = await import("child_process");
  const args = exeArgs ? exeArgs.split(" ").filter(Boolean) : [];
  spawn(exePath, args, { detached: true, stdio: "ignore" }).unref();
  return { ok: true };
});

// IPC: usuário clica em encerrar na home ou overlay
ipcMain.handle("end-session", async () => {
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  await endCurrentSession("user");
  destroyOverlay();
  destroyHomeWindow();
  showLockedState();
  return { ok: true };
});

// IPC: obter configuração atual
ipcMain.handle("get-config", () => getConfig());
ipcMain.handle("set-config", (_event: IpcMainInvokeEvent, partial: Record<string, string>) => {
  setConfig(partial);
  // Relancar o agente para ir direto à tela de lock com a nova configuração
  setTimeout(() => { app.relaunch(); app.exit(0); }, 800);
  return getConfig();
});

app.whenReady().then(async () => {
  const cfg = getConfig();

  if (!isConfigured()) {
    // Abrir janela de setup
    createSetupWindow();
    return;
  }

  // Subscrever Realtime para comandos de controle da máquina (shutdown remoto)
  unsubscribeMachineControl = subscribeToMachineControl(cfg.machineId, async () => {
    // Encerrar sessão ativa se houver, mostrar lock enquanto PC conta 10s para desligar
    if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    await endCurrentSession("system");
    destroyOverlay();
    destroyHomeWindow();
    showLockedState();
    // Lock exibe mensagem de shutdown (agente fecha sozinho quando o Windows desligar)
  });

  // Subscrever Realtime para mudanças de sessão externas (admin iniciando ou encerrando)
  unsubscribeSession = subscribeToSession(cfg.machineId, async (session) => {
    if (!session) {
      // Admin encerrou sessão remotamente
      if (sessionCheckInterval) clearInterval(sessionCheckInterval);
      destroyOverlay();
      destroyHomeWindow();
      showLockedState();
    } else {
      // Admin iniciou sessão remotamente via painel operador
      const apps = await fetchMachineApps();
      showHomeScreen(apps, session.nickname, session.creditsMinutes, session.endsAt.toISOString());
    }
  });

  showLockedState();
});

function createSetupWindow() {
  const setupWindow = new BrowserWindow({
    width: 480,
    height: 600,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  setupWindow.loadFile(path.join(__dirname, "../renderer/setup.html"));
}

app.on("window-all-closed", () => {
  // Não encerrar automaticamente: o overlay não aparece na taskbar,
  // então durante uma sessão ativa o "todas as janelas fechadas" seria
  // disparado erroneamente. Só encerramos via before-quit intencional.
  // No macOS nunca encerramos ao fechar janelas (comportamento padrão).
  if (process.platform === "darwin") return;
  // Em Windows, só encerrar se não houver sessão ativa
  if (!getCurrentSession() && !overlayWindow) {
    app.quit();
  }
});

app.on("before-quit", async () => {
  if (unsubscribeSession) unsubscribeSession();
  if (unsubscribeMachineControl) unsubscribeMachineControl();
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  await endCurrentSession("system");
  enableSystemKeys();
});
