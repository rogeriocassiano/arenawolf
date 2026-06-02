import Store from "electron-store";

interface AgentConfig {
  machineId: string;
  machineName: string;
  supabaseUrl: string;
  supabaseKey: string;
  apiBaseUrl: string;
  agentKey: string;
}

const store = new Store<AgentConfig>({
  name: "arena-wolf-config",
  defaults: {
    machineId: "",
    machineName: "",
    supabaseUrl: "https://uxxuspwortgwqaftcfrw.supabase.co",
    supabaseKey: "",
    apiBaseUrl: "https://arenawolf.netlify.app",
    agentKey: "",
  },
});

export function getConfig(): AgentConfig {
  return {
    machineId: store.get("machineId"),
    machineName: store.get("machineName"),
    supabaseUrl: store.get("supabaseUrl"),
    supabaseKey: store.get("supabaseKey"),
    apiBaseUrl: store.get("apiBaseUrl"),
    agentKey: store.get("agentKey"),
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
