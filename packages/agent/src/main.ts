import { app, BrowserWindow, ipcMain, screen, nativeTheme, IpcMainInvokeEvent } from "electron";
import path from "path";
import { getConfig, isConfigured, setConfig } from "./config";
import { validatePin, endCurrentSession, subscribeToSession, getRemainingSeconds, getCurrentSession, loginWithCredentials, fetchMachineApps } from "./session";
import { lockScreen, disableSystemKeys, enableSystemKeys } from "./lock";

nativeTheme.themeSource = "dark";

let lockWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let homeWindow: BrowserWindow | null = null;
let unsubscribeSession: (() => void) | null = null;
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
    width: 260,
    height: 105,
    x: width - 275,
    y: 16,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    resizable: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  overlayWindow.loadFile(path.join(__dirname, "../renderer/overlay.html"));
  // forward:true = clicks nos pixels transparentes passam para os apps normalmente
  // O widget em si (área opaca) bloqueia mouse events por design (overlay é só visual)
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
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

function showHomeScreen(apps: unknown[], nickname: string, credits: number, endsAt: string) {
  destroyLockScreen();
  if (!homeWindow || homeWindow.isDestroyed()) {
    createHomeWindow();
  }
  // Enviar dados para a home após carregar
  homeWindow?.webContents.once("did-finish-load", () => {
    homeWindow?.webContents.send("session-data", { apps, nickname, credits, endsAt });
  });
  // Se já carregou, enviar direto
  homeWindow?.webContents.send("session-data", { apps, nickname, credits, endsAt });
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
    showActiveSession();
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
ipcMain.handle("set-config", (_event: IpcMainInvokeEvent, partial: Record<string, string>) => { setConfig(partial); return getConfig(); });

app.whenReady().then(async () => {
  const cfg = getConfig();

  if (!isConfigured()) {
    // Abrir janela de setup
    createSetupWindow();
    return;
  }

  // Subscrever Realtime para mudanças de sessão externas (admin encerrando)
  unsubscribeSession = subscribeToSession(cfg.machineId, (session) => {
    if (!session) {
      if (sessionCheckInterval) clearInterval(sessionCheckInterval);
      destroyOverlay();
      showLockedState();
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
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async () => {
  if (unsubscribeSession) unsubscribeSession();
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  await endCurrentSession("system");
  enableSystemKeys();
});
