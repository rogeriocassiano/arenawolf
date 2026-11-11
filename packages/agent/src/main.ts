import { app, BrowserWindow, ipcMain, screen, nativeTheme, powerMonitor, IpcMainInvokeEvent } from "electron";
import path from "path";
import fs from "fs";
import os from "os";

const LOG_FILE = path.join(os.tmpdir(), "arena-wolf-agent.log");
function log(msg: string) {
  try { fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`); } catch {}
}
process.on("uncaughtException", (e) => log(`UNCAUGHT: ${e.stack}`));
process.on("unhandledRejection", (e) => log(`UNHANDLED: ${e}`));
log(`=== boot pid=${process.pid} electron=${process.versions.electron} ===`);

import { getConfig, isConfigured, setConfig } from "./config";
type SessionApi = typeof import("./session");
let sessionApi: SessionApi | null = null;
let sessionLoading: Promise<SessionApi> | null = null;
function loadSessionApi(): Promise<SessionApi> {
  return sessionLoading ??= import("./session").then(api => { sessionApi = api; return api; });
}
const getCurrentSession = () => sessionApi?.getCurrentSession() ?? null;
const getRemainingSeconds = () => sessionApi?.getRemainingSeconds() ?? 0;
const endCurrentSession = (reason: "user" | "system") => sessionApi?.endCurrentSession(reason) ?? Promise.resolve({ ok: true });
const validatePin = async (pin: string) => (await loadSessionApi()).validatePin(pin);
const loginWithCredentials = async (email: string, password: string) => (await loadSessionApi()).loginWithCredentials(email, password);
const fetchMachineApps = async () => (await loadSessionApi()).fetchMachineApps();
import { lockScreen, disableSystemKeys, enableSystemKeys } from "./lock";

if (nativeTheme) nativeTheme.themeSource = "dark";

const diagnosticMode = process.argv.includes("--diagnostic");
const clientShellMode = process.argv.includes("--client-shell") || (!diagnosticMode && getConfig().resumeClientShellOnce);
if (!diagnosticMode && getConfig().resumeClientShellOnce) setConfig({ resumeClientShellOnce: false });
let desktopStarted = false;
let pendingLogins = 0;
let applyingUpdate = false;
let quittingForUpdate = false;
let osSessionEnding = false;
let stopUpdates: (() => void) | null = null;
const releaseUpdate = async () => (await import("./updates")).releasePendingUpdate();
if (!diagnosticMode && !app.requestSingleInstanceLock()) app.exit(0);
app.on("second-instance", () => {
  const window = BrowserWindow.getAllWindows()[0];
  if (window) {
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  }
});

let lockWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let homeWindow: BrowserWindow | null = null;
let unsubscribeSession: (() => void) | null = null;
let unsubscribeMachineControl: (() => void) | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;
let activeSessionId: string | null = null;
let lastHeartbeatAttempt = 0;
let lastHeartbeatConfirmed = 0;
let heartbeatInFlight = false;

function stopSessionTimer() {
  if (sessionCheckInterval) clearInterval(sessionCheckInterval);
  sessionCheckInterval = null;
  activeSessionId = null;
}

function prepareForShutdown() {
  osSessionEnding = true;
  stopUpdates?.();
  void endCurrentSession("system");
}

function createLockScreen() {
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds;

  lockWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    show: false,
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

  const window = lockWindow;
  window.once("ready-to-show", () => {
    window.setBounds({ x, y, width, height });
    window.setKiosk(true);
    window.setFullScreen(true);
    window.setAlwaysOnTop(true, "screen-saver");
    window.show();
    window.focus();
    log(`lock visible=${window.isVisible()} fullscreen=${window.isFullScreen()} kiosk=${window.isKiosk()}`);
  });
  window.loadFile(path.join(__dirname, "../renderer/lock.html")).catch(error => log(`lock load failed: ${error}`));

  // Impedir que Alt+F4 ou qualquer sinal feche a janela de lock
  lockWindow.on("close", (e: { preventDefault: () => void }) => { if (!quittingForUpdate) { e.preventDefault(); lockWindow?.focus(); } });
  lockWindow.on("session-end", prepareForShutdown);

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

  overlayWindow.on("session-end", () => { void endCurrentSession("system"); });
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
  if (clientShellMode && !desktopStarted && process.platform === "win32") {
    desktopStarted = true;
    void import("child_process").then(({ spawn }) => {
      const desktop = spawn(path.join(process.env.SystemRoot ?? "C:\\Windows", "explorer.exe"), [], { detached: true, stdio: "ignore" });
      desktop.once("error", error => { desktopStarted = false; log(`falha ao abrir desktop após login: ${error.message}`); });
      desktop.unref();
    });
  }
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
  const sessionId = getCurrentSession()?.sessionId ?? null;
  if (sessionCheckInterval && activeSessionId === sessionId) return;
  stopSessionTimer();
  activeSessionId = sessionId;
  lastHeartbeatAttempt = 0;
  lastHeartbeatConfirmed = Date.now();
  sessionCheckInterval = setInterval(() => {
    const remaining = getRemainingSeconds();
    const session = getCurrentSession();
    if (session?.instanceId && sessionApi && !heartbeatInFlight && Date.now() - lastHeartbeatAttempt >= 10000) {
      heartbeatInFlight = true;
      lastHeartbeatAttempt = Date.now();
      sessionApi.confirmSessionHeartbeat().then(result => {
        if (activeSessionId !== session.sessionId) return;
        if (result.ok && !result.ended) lastHeartbeatConfirmed = Date.now();
        if (result.ended || (!result.ok && Date.now() - lastHeartbeatConfirmed >= 30000)) {
          log(result.ended ? "sessão encerrada no servidor" : "sessão bloqueada por perda de conexão");
          stopSessionTimer();
          sessionApi?.resetAgentInstance();
          destroyHomeWindow();
          showLockedState();
        }
      }).finally(() => { heartbeatInFlight = false; });
    }
    // creditsRemaining = minutos restantes na sessão (tempo que ainda será consumido)
    const creditsRemaining = session?.creditsMinutes ?? 0;
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
  stopSessionTimer();
  await endCurrentSession("system");
  destroyOverlay();
  destroyHomeWindow();
  showLockedState();
}

// IPC: login com email + senha (substitui PIN)
ipcMain.handle("login-credentials", async (_event: IpcMainInvokeEvent, email: string, password: string) => {
  pendingLogins++;
  try { return await finishLogin(() => loginWithCredentials(email, password)); }
  finally { pendingLogins--; }
});
async function finishLogin(login: () => Promise<{ ok: boolean; session?: { nickname: string; creditsMinutes: number; endsAt: Date }; error?: string }>) {
  const result = await login();
  if (result.ok && result.session) {
    // Buscar apps e enviar para home
    const apps = await fetchMachineApps();
    showHomeScreen(apps, result.session.nickname, result.session.creditsMinutes, result.session.endsAt.toISOString());
    return { ok: true, nickname: result.session.nickname };
  }
  return { ok: false, error: result.error };
}

// IPC: recebido da tela de bloqueio quando usuário digita PIN (compatibilidade)
ipcMain.handle("submit-pin", async (_event: IpcMainInvokeEvent, pin: string) => {
  const cfg = getConfig();
  if (!cfg.machineId) return { ok: false, error: "Máquina não configurada" };
  pendingLogins++;
  try { return await finishLogin(() => validatePin(pin)); }
  finally { pendingLogins--; }
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
  const result = await endCurrentSession("user");
  if (!result.ok) return result;
  stopSessionTimer();
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
  log("whenReady");
  if (process.argv.includes("--diagnostic")) {
    const diagnosticWindow = new BrowserWindow({ width: 900, height: 700, webPreferences: { contextIsolation: true, nodeIntegration: false } });
    await diagnosticWindow.loadFile(path.join(__dirname, "../renderer/lock.html"));
    log(`diagnostic loaded visible=${diagnosticWindow.isVisible()}`);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const cfg = getConfig();
      const { default: WebSocket } = await import("ws");
      const client = createClient(cfg.supabaseUrl, cfg.supabaseKey, { realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket } });
      const probe = client.channel("diagnostic-probe").subscribe();
      await client.removeChannel(probe);
      log("diagnostic realtime initialized");
    } catch (error) {
      log(`diagnostic realtime failed: ${error}`);
    }
    diagnosticWindow.show();
    setTimeout(() => app.exit(0), 10000);
    return;
  }
  if (process.platform === "win32" && app.isPackaged) {
    app.setLoginItemSettings({ openAtLogin: !clientShellMode, path: process.execPath, args: [] });
  powerMonitor?.on("shutdown", prepareForShutdown);
    log(`startup registered=${app.getLoginItemSettings().openAtLogin}`);
  }
  const cfg = getConfig();
  log(`configured=${isConfigured()} machineId=${cfg.machineId || "(vazio)"}`);

  if (!isConfigured()) {
    // Abrir janela de setup
    log("abrindo setup");
    createSetupWindow();
    return;
  }
  log("abrindo lock screen");
  showLockedState();
  await new Promise<void>(resolve => {
    if (lockWindow?.isVisible()) resolve();
    else lockWindow?.once("show", () => resolve());
  });
  const { subscribeToSession, subscribeToMachineControl } = await loadSessionApi();
  log("serviços de sessão carregados após a janela local");

  if (app.isPackaged && process.platform === "win32") {
    void (async () => {
      try {
        const [{ autoUpdater }, updates] = await Promise.all([import("electron-updater"), import("./updates")]);
        const manager = updates.manageUpdates(autoUpdater, {
          canInstall: () => !osSessionEnding && pendingLogins === 0 && !getCurrentSession() && !applyingUpdate,
          prepare: updates.reserveMachineForUpdate,
          beforeInstall: () => {
            applyingUpdate = true;
            quittingForUpdate = true;
            if (clientShellMode) setConfig({ resumeClientShellOnce: true });
            stopUpdates?.();
          },
          cancel: () => updates.releasePendingUpdate(),
          log,
        });
        stopUpdates = manager.stop;
        log("gerenciador de atualizações ativo");
      } catch (error) {
        log(`atualização automática indisponível: ${error}`);
      }
    })();
  }

  // Subscrever Realtime para comandos de controle da máquina (shutdown remoto)
  unsubscribeMachineControl = subscribeToMachineControl(cfg.machineId, async () => {
    // Encerrar sessão ativa se houver, mostrar lock enquanto PC conta 10s para desligar
    stopSessionTimer();
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
      stopSessionTimer();
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
  stopSessionTimer();
  if (!quittingForUpdate) await endCurrentSession("system");
  enableSystemKeys();
});
