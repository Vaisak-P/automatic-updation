const { app, BrowserWindow, Menu, ipcMain } = require('electron/main')
const path = require('node:path')
const { AppUpdater, autoUpdater } = require("electron-updater");
const { dialog } = require('electron');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.on("checking-for-update", () => {
  dialog.showMessageBox({message: "checking-for-update"})
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    message: 'An update is available. Do you want to download and install it?',
    buttons: ['Yes', 'No'],
    defaultId: 0, // Index of the default button (Yes)
    cancelId: 1, // Index of the cancel button (No)
  }).then((response) => {
    if (response.response === 0) {
      autoUpdater.downloadUpdate();
    } else {
      // User clicked 'No', do something else or inform the user
    }
  }).catch((err) => {
    console.error('Error showing message box:', err);
  });
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    message: 'Update downloaded. Do you want to install it now?',
    buttons: ['Install', 'Later'],
    defaultId: 0, // Index of the default button (Install)
    cancelId: 1, // Index of the cancel button (Later)
  }).then((response) => {
    if (response.response === 0) {
      // User clicked 'Install', proceed with update installation
      autoUpdater.quitAndInstall();
    } else {
      // User clicked 'Later', you can inform the user or take other actions
    }
  }).catch((err) => {
    console.error('Error showing message box:', err);
  });
});



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