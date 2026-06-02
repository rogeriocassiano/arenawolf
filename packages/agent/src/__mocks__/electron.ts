export const app = { whenReady: jest.fn(), on: jest.fn(), quit: jest.fn() };
export const BrowserWindow = jest.fn();
export const ipcMain = { handle: jest.fn(), on: jest.fn() };
export const screen = { getPrimaryDisplay: () => ({ workAreaSize: { width: 1920, height: 1080 } }) };
export const nativeTheme = { themeSource: "dark" };
export const contextBridge = { exposeInMainWorld: jest.fn() };
export const ipcRenderer = { invoke: jest.fn(), on: jest.fn() };
