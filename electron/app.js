const electron = require('electron');
var app = electron.app  // Module to control application life.
var BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
// We can listen to messages from the renderer here:
const ipcMain = electron.ipcMain;
fs = require('fs')

// Report crashes to our server.
//electron.crashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform != 'darwin') {
    app.quit();
  //}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    'min-width': 500,
    'min-height': 200,
    'accept-first-mouse': true,
    'title-bar-style': 'hidden'
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  var webContents = mainWindow.webContents;
  webContents.openDevTools();

  const datadir = app.getPath('userData')
  const lastFileStorage = datadir + '/lastFileSelected.json'

  webContents.on('did-finish-load', function() {

    // we load the last file selected and send it to the client
    fs.readFile(lastFileStorage, function(err, data) {
      var str;
      if(data && (str = data.toString())) {
        try {
          webContents.send("last-file-selected", JSON.parse(str))
        } catch(e) {
          console.log("error", e)
        }
      }
    })

    // whenever the client loads a new file we save it as the last file selected
    ipcMain.on('file-selected', function(event, file) {
      //console.log("file selected", file);
      fs.writeFile(lastFileStorage, file, function(err) {
        if(err) console.log(err);
        console.log("written", file, lastFileStorage)
      })
    });
  })


});
