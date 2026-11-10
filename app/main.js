const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "www", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, "www", "index.html"));
  mainWindow.on("closed", () => { mainWindow = null; });
}

// Lista štampača instaliranih na računaru
ipcMain.handle("get-printers", async () => {
  if (!mainWindow) return [];
  const list = await mainWindow.webContents.getPrintersAsync();
  return list.map((p) => ({ name: p.name, displayName: p.displayName || p.name, isDefault: !!p.isDefault }));
});

// Tiho štampanje trenutne stranice (izveštaja) na izabrani štampač
ipcMain.handle("print-silent", (event, deviceName) => {
  return new Promise((resolve) => {
    if (!mainWindow) return resolve({ ok: false, reason: "Prozor nije otvoren." });
    mainWindow.webContents.print(
      { silent: true, printBackground: true, deviceName: deviceName || "" },
      (success, failureReason) => {
        resolve({ ok: !!success, reason: failureReason || "" });
      }
    );
  });
});

// Automatski štampač: uzima podrazumevani štampač koji je uključen i povezan
ipcMain.handle("print-default", async () => {
  if (!mainWindow) return { ok: false, reason: "Prozor nije otvoren." };
  const list = await mainWindow.webContents.getPrintersAsync();
  const target = list.find((p) => p.isDefault) || list[0];
  if (!target) return { ok: false, reason: "Nijedan štampač nije instaliran na računaru." };
  return new Promise((resolve) => {
    mainWindow.webContents.print(
      { silent: true, printBackground: true, deviceName: target.name },
      (success, failureReason) => resolve({ ok: !!success, reason: failureReason || "", printer: target.displayName || target.name })
    );
  });
});

// Automatsko ažuriranje: proverava novu verziju na adresi iz package.json (build.publish),
// preuzima je u pozadini i pita korisnika da li da restartuje aplikaciju.
function setupUpdater() {
  if (!app.isPackaged) return;                       // u razvoju ne proverava
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on("update-downloaded", async () => {
    const res = await dialog.showMessageBox(mainWindow || undefined, {
      type: "info",
      buttons: ["Restartuj sada", "Kasnije"],
      defaultId: 0,
      cancelId: 1,
      title: "Nova verzija",
      message: "Nova verzija aplikacije je preuzeta.",
      detail: "Restartuj aplikaciju da bi se promene primenile."
    });
    if (res.response === 0) autoUpdater.quitAndInstall();
  });
  autoUpdater.on("error", () => { /* bez mreže ili bez objavljene verzije: tiho */ });
  autoUpdater.checkForUpdates().catch(() => {});
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 6 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  createWindow();
  setupUpdater();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
