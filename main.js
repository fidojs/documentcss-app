const {app, BrowserWindow, Menu, protocol, ipcMain} = electron = require('electron');
const {autoUpdater} = require("electron-updater");

//-------------------------------------------------------------------
// Define the menu
//-------------------------------------------------------------------
let template = []
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  })
}

//-------------------------------------------------------------------
// Open a window that displays the version
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
  console.log('sendStatusToWindow', text);
  //win.webContents.send('message', text);
}
//function createDefaultWindow() {
//  win = new BrowserWindow();
//  //win.webContents.openDevTools();
//  win.on('closed', () => {
//    win = null;
//  });
//  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
//  return win;
//}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater.');
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});
app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

//-------------------------------------------------------------------
// Auto updates
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
autoUpdater.on('update-downloaded', (info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});

const fixPath = require('fix-path')
const path = require('path')
const url = require('url')
const os = require('os');
const fse = require('fs-extra');

const prompt = require('electron-prompt')

console.log('before', process.env.PATH);
// npm start works without
// npm dist breaks without
// npm start work with
// npm dist works with
// yarn start works without
// yarn dist breaks without
// yarn start breaks with
// yarn dist works with
fixPath();
console.log('after', process.env.PATH);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  prompt({
      title: 'Project Directory',
      label: "~/",
      value: 'Desktop/livestyleguide'
  })
  .then((projectDirectory) => {
    // Will be null if window was closed, or user clicked Cancel.
    if (projectDirectory == null) {
      app.quit(); // abort mission
    }

    const projectPath = path.join(os.homedir(), projectDirectory);

    // Copy starter to new directory.
    if (! fse.existsSync(projectPath)) {
      fse.copySync(path.join(__dirname, 'lsg-starter'), projectPath);
    }

    // Startup server.
    const server = require("./server")(projectPath)
    server.startup()

    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: width,
      height: height
    })

    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:3000/console-app')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
  })
  .catch(console.error);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
