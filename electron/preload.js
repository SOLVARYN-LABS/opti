const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('optidzDesktop', {
  isDesktop: true,
  load: () => ipcRenderer.invoke('db:load'),
  save: (json) => ipcRenderer.invoke('db:save', json),
  loadDb: () => ipcRenderer.invoke('db:loadBin'),
  saveDb: (bytes) => ipcRenderer.invoke('db:saveBin', bytes),
  backup: (json) => ipcRenderer.invoke('db:backup', json),
  loadVault: () => ipcRenderer.invoke('vault:load'),
  saveVault: (json) => ipcRenderer.invoke('vault:save', json),
  claude: (payload) => ipcRenderer.invoke('ai:claude', payload),
  claudeStatus: () => ipcRenderer.invoke('ai:status'),
  openBluetooth: () => ipcRenderer.invoke('sys:openBluetooth'),
  listScanDevices: () => ipcRenderer.invoke('sys:listScanDevices')
});
