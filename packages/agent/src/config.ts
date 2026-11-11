import Store from "electron-store";

interface AgentConfig {
  machineId: string;
  machineName: string;
  supabaseUrl: string;
  supabaseKey: string;
  apiBaseUrl: string;
  agentKey: string;
  updateToken: string;
  updateLeaseId: string;
  resumeClientShellOnce: boolean;
}

const store = new Store<AgentConfig>({
  name: "arena-wolf-config",
  defaults: {
    machineId: "",
    machineName: "",
    supabaseUrl: "https://wuobcpjzprvbmogvqiqq.supabase.co",
    supabaseKey: "",
    apiBaseUrl: "https://arena-wolftech-app.netlify.app",
    agentKey: "",
    updateToken: "",
    updateLeaseId: "",
    resumeClientShellOnce: false,
  },
});

export function getConfig(): AgentConfig {
  return {
    machineId: store.get("machineId"),
    machineName: store.get("machineName"),
    supabaseUrl: store.get("supabaseUrl"),
    supabaseKey: store.get("supabaseKey"),
    apiBaseUrl: ["https://arenawolftech.netlify.app", "https://arenawolf.netlify.app"].includes(store.get("apiBaseUrl"))
      ? "https://arena-wolftech-app.netlify.app"
      : store.get("apiBaseUrl"),
    agentKey: store.get("agentKey"),
    updateToken: store.get("updateToken") ?? "",
    updateLeaseId: store.get("updateLeaseId") ?? "",
    resumeClientShellOnce: store.get("resumeClientShellOnce") ?? false,
  };
}

export function setConfig(partial: Partial<AgentConfig>): void {
  Object.entries(partial).forEach(([key, value]) => {
    store.set(key as keyof AgentConfig, value);
  });
}

export function isConfigured(): boolean {
  const cfg = getConfig();
  return !!(cfg.machineId && cfg.supabaseUrl && cfg.supabaseKey);
}
