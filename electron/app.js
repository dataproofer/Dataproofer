const electron = require('electron');
var app = electron.app  // Module to control application life.
var BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
var Menu = require('menu')
var defaultMenu = require('electron-default-menu')
var uuid = require('uuid');
// We can listen to messages from the renderer here:
const ipcMain = electron.ipcMain;
fs = require('fs')

var DEVELOPMENT = process.argv[2] && process.argv[2] == "--dev"

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
    'title-bar-style': 'hidden',
    icon: __dirname + '/icons/dataproofer-logo-large.png'
  });

  var menu = defaultMenu();
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

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

  if(DEVELOPMENT)
    webContents.openDevTools();

  const datadir = app.getPath('userData')
  const lastFileStorage = datadir + '/lastFileSelected.json'
  const lastTestConfigStorage = datadir + '/lastTestConfig.json'
  const savedTestsStorage = datadir + '/savedTestsStorage'
  //make sure this directory exists, if it already exists all the better
  fs.mkdir(savedTestsStorage, function(err) {
    //if(err) console.log(err)
  })

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
    ipcMain.on('file-selected', function(evt, file) {
      //console.log("file selected", file);
      fs.writeFile(lastFileStorage, file, function(err) {
        if(err) console.log(err);
        //console.log("written", file, lastFileStorage)
      })
    });
    // load any tests saved in the saved-test directory
    fs.readdir(savedTestsStorage, function(err, files) {
      if(files.length === 0) {
        // we are starting with an empty directory, let's put a couple default
        // tests in for the user
      }
      var tests = []
      console.log("STORAGE DIR", savedTestsStorage)
      // loop through the files and turn them into json objects
      files.forEach(function(filepath) {
        try {
          var json = fs.readFileSync(savedTestsStorage + "/" + filepath).toString()
          var testFile = JSON.parse(json);
          // TODO: make sure this makes sense
          testFile.filename = filepath;
          tests.push(testFile)
        } catch(e) {}
      })
      webContents.send("load-saved-tests", tests)
    });

    // we want to save tests to the local file system for later use.
    /*
    we expect a test to be in the following format
    {
      name: "string",
      description: "string",
      filename: "string" (if this was loaded previously),
      methodology: "string", the contents of the methodology function
    }
    */
    ipcMain.on('save-test', function(evt, test) {
      console.log("save test", test.name, test.filename)
      var filename = test.filename;
      if(!filename) {
        // we need to create a filename
        filename = uuid.v1();
      }
      fs.writeFile(savedTestsStorage + "/" + filename, JSON.stringify(test))
    })

    ipcMain.on('delete-test', function(evt, filename) {
      console.log("delete", filename)
      fs.unlink(savedTestsStorage + "/" + filename, function(err) { /* if(err) console.log(err) */ })
    })


    // we load the last test configuration used and send it to the client
    fs.readFile(lastTestConfigStorage, function(err, data) {
      var str;
      if(data && (str = data.toString())) {
        try {
          webContents.send("last-test-config", JSON.parse(str))
        } catch(e) {
          console.log("error", e)
        }
      }
    })

    // whenever the client loads a new file we save it as the last file selected
    ipcMain.on('test-config', function(evt, config) {
      console.log("test config", config.name, config.config);
      fs.writeFile(lastTestConfigStorage, JSON.stringify(config.config, null, 2), function(err) {
        if(err) console.log(err);
        //console.log("written", config, lastTestConfigStorage)
      })
    });

  })
});

function stripFileName(filename) {
  return filename.replace(/s+/g, '-');
}
