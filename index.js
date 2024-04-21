const { app, BrowserWindow, Menu, ipcMain } = require('electron/main')
const path = require('node:path')
const { AppUpdater, autoUpdater } = require("electron-updater");
const { dialog } = require('electron');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.on("checking-for-update", () => {
  dialog.showMessageBox({message: "checking-for-update"})
})
autoUpdater.on("update-available", () => {
  dialog.showMessageBox({message: "update-available"})
})
autoUpdater.on("update-not-available", () => {
  dialog.showMessageBox({message: "update-not-available"})
})


function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => mainWindow.webContents.send('update-counter', 1),
          label: 'Increment'
        },
        {
          click: () => mainWindow.webContents.send('update-counter', -1),
          label: 'Decrement'
        }
      ]
    }

  ])

  Menu.setApplicationMenu(menu)
  mainWindow.loadFile('index.html')
  autoUpdater.checkForUpdatesAndNotify();

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.on('counter-value', (_event, value) => {
    console.log(value) // will print value to Node console
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})