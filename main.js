const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

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
