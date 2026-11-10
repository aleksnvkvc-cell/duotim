const { contextBridge, ipcRenderer } = require("electron");

// Mali, siguran most između stranice i glavnog procesa (štampači)
contextBridge.exposeInMainWorld("electronAPI", {
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  printSilent: (deviceName) => ipcRenderer.invoke("print-silent", deviceName),
  printDefault: () => ipcRenderer.invoke("print-default")
});
