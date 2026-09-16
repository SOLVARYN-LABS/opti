const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { chat, readKey } = require('../backend/claude-api');

const dataFile = () => path.join(app.getPath('userData'), 'optidz-data-v3.json');
const sqliteFile = () => path.join(app.getPath('userData'), 'optidz.sqlite');
const vaultFile = () => path.join(app.getPath('userData'), 'optidz-license-vault.json');

function resolveIcon() {
  const candidates = [
    path.join(__dirname, '..', 'assets', 'icon.ico'),
    path.join(__dirname, '..', 'assets', 'logo-mark.png'),
    path.join(process.resourcesPath || '', 'assets', 'icon.ico'),
    path.join(__dirname, '..', 'build', 'icon.ico')
  ];
  return candidates.find((p) => {
    try { return fs.existsSync(p); } catch { return false; }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    title: 'OptiDZ — Gestion d’optique',
    icon: resolveIcon(),
    backgroundColor: '#0F6E66',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.maximize();
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  process.env.OPTIDZ_CLAUDE_KEY_FILE = path.join(app.getPath('userData'), 'claude.key');
  const keySources = [
    path.join(__dirname, '..', 'backend', 'claude.key'),
    path.join(process.resourcesPath || '', 'claude.key')
  ];
  try {
    if (!fs.existsSync(process.env.OPTIDZ_CLAUDE_KEY_FILE)) {
      for (const src of keySources) {
        if (fs.existsSync(src) && fs.readFileSync(src, 'utf8').trim()) {
          fs.mkdirSync(app.getPath('userData'), { recursive: true });
          fs.copyFileSync(src, process.env.OPTIDZ_CLAUDE_KEY_FILE);
          break;
        }
      }
    }
  } catch {}
  ipcMain.handle('db:load', async () => {
    try {
      return fs.readFileSync(dataFile(), 'utf8');
    } catch {
      return null;
    }
  });
  ipcMain.handle('db:save', async (_e, json) => {
    fs.writeFileSync(dataFile(), json, 'utf8');
    return true;
  });
  ipcMain.handle('db:loadBin', async () => {
    try {
      return fs.readFileSync(sqliteFile());
    } catch {
      return null;
    }
  });
  ipcMain.handle('db:saveBin', async (_e, bytes) => {
    fs.writeFileSync(sqliteFile(), Buffer.from(bytes));
    return true;
  });
  ipcMain.handle('ai:claude', async (_e, payload) => {
    return chat({
      system: String(payload?.system || ''),
      messages: Array.isArray(payload?.messages) ? payload.messages : [],
      model: payload?.model,
      max_tokens: payload?.max_tokens
    });
  });
  ipcMain.handle('ai:status', async () => {
    const key = readKey();
    return { ready: !!(key && key.length > 20) };
  });
  ipcMain.handle('sys:openBluetooth', async () => {
    await shell.openExternal('ms-settings:bluetooth');
    return true;
  });
  ipcMain.handle('sys:listScanDevices', async () => {
    const { execFile } = require('child_process');
    return new Promise((resolve) => {
      const ps = `
        $ErrorActionPreference='SilentlyContinue'
        Get-PnpDevice | Where-Object {
          $_.FriendlyName -match 'bluetooth|scanner|barcode|honeywell|zebra|symbol|datalogic|netum|newland|cipherlab|douchette|hid'
          -or $_.Class -match 'Bluetooth|HIDClass|Ports'
        } | Select-Object -First 40 FriendlyName, Status, Class |
        ForEach-Object {
          [PSCustomObject]@{
            name = $_.FriendlyName
            status = $_.Status
            class = $_.Class
            ok = ($_.Status -eq 'OK')
          }
        } | ConvertTo-Json -Compress
      `;
      execFile('powershell.exe', ['-NoProfile', '-Command', ps], { timeout: 12000, windowsHide: true }, (err, stdout) => {
        if (err || !stdout) return resolve([]);
        try {
          const data = JSON.parse(String(stdout).trim() || '[]');
          resolve(Array.isArray(data) ? data : [data]);
        } catch {
          resolve([]);
        }
      });
    });
  });
  ipcMain.handle('db:backup', async (_e, json) => {
    const dir = path.join(app.getPath('userData'), 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const file = path.join(dir, 'optidz-' + stamp + '.json');
    fs.writeFileSync(file, json, 'utf8');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    while (files.length > 14) {
      fs.unlinkSync(path.join(dir, files.shift()));
    }
    return file;
  });
  ipcMain.handle('vault:load', async () => {
    try { return fs.readFileSync(vaultFile(), 'utf8'); } catch { return null; }
  });
  ipcMain.handle('vault:save', async (_e, json) => {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(vaultFile(), json, 'utf8');
    return true;
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
