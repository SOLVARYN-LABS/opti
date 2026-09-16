const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const vaultFile = () => path.join(app.getPath('userData'), 'optidz-license-vault.json');

function resolveIcon() {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'icon.ico'),
    path.join(__dirname, '..', 'build', 'icon.ico')
  ];
  return candidates.find((p) => {
    try { return fs.existsSync(p); } catch { return false; }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: 'OptiDZ Admin — Éditeur',
    icon: resolveIcon(),
    backgroundColor: '#052E2B',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, '..', 'admin', 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('vault:load', async () => {
    try { return fs.readFileSync(vaultFile(), 'utf8'); } catch { return null; }
  });
  ipcMain.handle('vault:save', async (_e, json) => {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(vaultFile(), json, 'utf8');
    return true;
  });
  // stubs so preload does not crash if other APIs are called
  ipcMain.handle('db:load', async () => null);
  ipcMain.handle('db:save', async () => true);
  ipcMain.handle('db:loadBin', async () => null);
  ipcMain.handle('db:saveBin', async () => true);
  ipcMain.handle('db:backup', async () => '');
  ipcMain.handle('ai:claude', async () => ({ error: 'Admin only' }));
  ipcMain.handle('ai:status', async () => ({ ready: false }));
  ipcMain.handle('sys:openBluetooth', async () => true);
  ipcMain.handle('sys:listScanDevices', async () => []);
  createWindow();
});

app.on('window-all-closed', () => app.quit());
