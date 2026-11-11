import { randomUUID } from "crypto";
import type { AppUpdater } from "electron-updater";
import { getConfig, setConfig } from "./config";

export type UpdateEngine = Pick<AppUpdater, "autoDownload" | "autoInstallOnAppQuit" | "allowDowngrade" | "allowPrerelease" | "logger" | "on" | "removeListener" | "checkForUpdates" | "quitAndInstall">;

interface UpdatePolicy {
  canInstall: () => boolean;
  prepare: () => Promise<boolean>;
  beforeInstall: () => void;
  cancel: () => Promise<unknown>;
  log: (message: string) => void;
}

async function updateRequest(action: "claim" | "release", instanceId: string): Promise<boolean> {
  const cfg = getConfig();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.updateToken) headers["x-agent-update-token"] = cfg.updateToken;
  else if (cfg.agentKey) headers["x-agent-key"] = cfg.agentKey;
  else return false;
  try {
    const response = await fetch(`${cfg.apiBaseUrl}/api/agent/update`, {
      method: "POST", headers,
      body: JSON.stringify({ action, machine_id: cfg.machineId, instance_id: instanceId }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    return response.ok && data.success === true;
  } catch {
    return false;
  }
}

let releasing: Promise<boolean> | null = null;

export async function releasePendingUpdate(): Promise<boolean> {
  if (releasing) return releasing;
  const leaseId = getConfig().updateLeaseId;
  if (!leaseId) return true;
  releasing = (async () => {
    const released = await updateRequest("release", leaseId);
    if (released && getConfig().updateLeaseId === leaseId) setConfig({ updateLeaseId: "" });
    return released;
  })();
  try { return await releasing; } finally { releasing = null; }
}

export async function reserveMachineForUpdate(): Promise<boolean> {
  if (!(await releasePendingUpdate())) return false;
  const leaseId = randomUUID();
  setConfig({ updateLeaseId: leaseId });
  if (await updateRequest("claim", leaseId)) return true;
  await releasePendingUpdate();
  return false;
}

export function manageUpdates(updater: UpdateEngine, policy: UpdatePolicy): { stop: () => void; checkNow: () => Promise<void> } {
  let ready = false;
  let stopped = false;
  let preparing = false;
  let installing = false;
  let checking = false;
  updater.autoDownload = true;
  updater.autoInstallOnAppQuit = false;
  updater.allowDowngrade = false;
  updater.allowPrerelease = false;
  updater.logger = null;

  async function cancel() {
    installing = false;
    await policy.cancel().catch(() => policy.log("atualização: liberação pendente até reconectar"));
  }

  async function applyIfSafe() {
    if (stopped || !ready || preparing || installing || !policy.canInstall()) return;
    preparing = true;
    try {
      if (!(await policy.prepare()) || stopped || !policy.canInstall()) {
        await cancel();
        return;
      }
      policy.beforeInstall();
      installing = true;
      updater.quitAndInstall(true, true);
    } catch {
      policy.log("atualização: instalação adiada com segurança");
      await cancel();
    } finally {
      preparing = false;
    }
  }

  async function checkNow() {
    if (stopped || checking) return;
    checking = true;
    try { await updater.checkForUpdates(); }
    catch { policy.log("atualização: verificação indisponível; nova tentativa agendada"); }
    finally { checking = false; }
  }

  const downloaded = () => {
    ready = true;
    policy.log("atualização baixada; aguardando máquina ociosa e confirmação do servidor");
    void applyIfSafe();
  };
  const error = () => {
    policy.log("atualização indisponível; versão atual mantida");
    if (installing) void cancel();
  };
  updater.on("update-downloaded", downloaded);
  updater.on("error", error);
  const initial = setTimeout(() => { void checkNow(); }, 60000);
  const checks = setInterval(() => { void checkNow(); }, 6 * 3600000);
  const installs = setInterval(() => { void applyIfSafe(); }, 30000);
  initial.unref();
  checks.unref();
  installs.unref();
  return {
    checkNow,
    stop() {
      stopped = true;
      clearTimeout(initial);
      clearInterval(checks);
      clearInterval(installs);
      updater.removeListener("update-downloaded", downloaded);
      updater.removeListener("error", error);
    },
  };
}
