import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("agent", {
  submitPin: (pin: string) => ipcRenderer.invoke("submit-pin", pin),
  endSession: () => ipcRenderer.invoke("end-session"),
  getConfig: () => ipcRenderer.invoke("get-config"),
  setConfig: (partial: Record<string, string>) => ipcRenderer.invoke("set-config", partial),
  onTick: (callback: (data: { remaining: number; session: unknown }) => void) => {
    ipcRenderer.on("tick", (_event, data) => callback(data));
  },
});
