import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("agent", {
  submitPin: (pin: string) => ipcRenderer.invoke("submit-pin", pin),
  loginCredentials: (email: string, password: string) => ipcRenderer.invoke("login-credentials", email, password),
  endSession: () => ipcRenderer.invoke("end-session"),
  fetchApps: () => ipcRenderer.invoke("fetch-apps"),
  launchApp: (exePath: string, exeArgs: string) => ipcRenderer.invoke("launch-app", exePath, exeArgs),
  getConfig: () => ipcRenderer.invoke("get-config"),
  setConfig: (partial: Record<string, string>) => ipcRenderer.invoke("set-config", partial),
  onTick: (callback: (data: { remaining: number; session: unknown }) => void) => {
    ipcRenderer.on("tick", (_event: unknown, data: { remaining: number; session: unknown }) => callback(data));
  },
  onSessionData: (callback: (data: unknown) => void) => {
    ipcRenderer.on("session-data", (_event: unknown, data: unknown) => callback(data));
  },
});
