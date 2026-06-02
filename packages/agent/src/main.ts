import { app, BrowserWindow, ipcMain, screen, nativeTheme } from "electron";
import path from "path";
import { getConfig, isConfigured, setConfig } from "./config";
import { validatePin, endCurrentSession, subscribeToSession, getRemainingSeconds, getCurrentSession } from "./session";
import { lockScreen, disableSystemKeys, enableSystemKeys } from "./lock";

nativeTheme.themeSource = "dark";

let lockWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
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

  disableSystemKeys();
}

function createOverlay() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 300,
    height: 120,
    x: width - 320,
    y: 20,
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
  overlayWindow.setIgnoreMouseEvents(true);
}

function destroyOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
}

function destroyLockScreen() {
  if (lockWindow && !lockWindow.isDestroyed()) {
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

function showActiveSession() {
  destroyLockScreen();
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlay();
  }
  // Iniciar tick do countdown
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  sessionCheckInterval = setInterval(() => {
    const remaining = getRemainingSeconds();
    overlayWindow?.webContents.send("tick", { remaining, session: getCurrentSession() });
    if (remaining <= 0) {
      handleSessionExpired();
    }
  }, 1000);
}

async function handleSessionExpired() {
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  await endCurrentSession("system");
  destroyOverlay();
  showLockedState();
}

// IPC: recebido da tela de bloqueio quando usuário digita PIN
ipcMain.handle("submit-pin", async (_event, pin: string) => {
  const cfg = getConfig();
  if (!cfg.machineId) return { ok: false, error: "Máquina não configurada" };

  const result = await validatePin(pin);
  if (result.ok && result.session) {
    showActiveSession();
    return { ok: true, nickname: result.session.nickname };
  }
  return { ok: false, error: result.error };
});

// IPC: usuário clica em encerrar na overlay
ipcMain.handle("end-session", async () => {
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  await endCurrentSession("user");
  destroyOverlay();
  showLockedState();
  return { ok: true };
});

// IPC: obter configuração atual
ipcMain.handle("get-config", () => getConfig());
ipcMain.handle("set-config", (_event, partial) => { setConfig(partial); return getConfig(); });

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
