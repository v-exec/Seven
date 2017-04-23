const electron = require('electron');

//module to control application life
const app = electron.app;

//keep a global reference of the window object to keep window open
let mainWindow;

//get command arguments
global.arguments = {arg: process.argv};
global.reset = {r: true};

//keeps window instances to one
var shouldQuit = app.makeSingleInstance(function(argv, workingDirectory) {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    global.arguments = {arg: argv};
    global.reset = {r: true};
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

//module to create native browser window
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');


function createWindow () {
  //create the browser window
  mainWindow = new BrowserWindow({width: 1280, height: 720, icon: __dirname + '/icon.png'});
  mainWindow.setMenu(null);

  //load the index.html of the app
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  //emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

//emitted when electron is finished initializing
app.on('ready', createWindow);

//quit when all windows are closed
app.on('window-all-closed', function () {
  //keep open on OS platforms 'cause they're weird
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//turning on app
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});