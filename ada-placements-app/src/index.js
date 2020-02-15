const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const contextMenu = require('electron-context-menu');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');


const TOKEN_PATH = 'token.json';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

contextMenu({
  showInspectElement: false
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let googleAuthWindow;
let oAuth2Client;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.setMenuBarVisibility(true);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    googleAuthWindow = null;
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function loadScoresFromFile() {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  }).then(result => {
    if (!result.canceled) {
      // send the filepath to the placements page
      mainWindow.webContents.send('loadScoresFromFile', result.filePaths[0]);
    }
  });
};

function createAuthWindow(authUrl) {
  // Create the browser window.
  googleAuthWindow = new BrowserWindow({
    width: 400,
    height: 200,
    title: 'Google Authentication',
    webPreferences: {
      nodeIntegration: true
    }
  });

  googleAuthWindow.loadFile(path.join(__dirname, 'googleAuth.html')).then(value => {
    googleAuthWindow.webContents.send('authUrl', authUrl);
  });

  // garbage collection
  googleAuthWindow.on('close', function() {
    googleAuthWindow = null;
  })
};

ipcMain.on('authCode', (event, authCode) => {
  googleAuthWindow.close();

  oAuth2Client.getToken(authCode, (err, token) => {
    if (err) {
      dialog.showErrorBox('Error Authenticating', "The provided authentication code was incorrect.");
      return
    }
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    getAndSendSheetsURL();
  });
});

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  createAuthWindow(authUrl);
}

function getAndSendSheetsURL() {
  mainWindow.webContents.send('loadScoresFromSheets', 'https://docs.google.com/spreadsheets/d/1ZasXRqaQEE4y5ATvELnwKwmUvP5aN5w5YDme4-2ufns/edit#gid=0');
}

function loadScoresFromSheets() {
  fs.readFile('credentials.json', (err, content) => {
    if (err) {
      dialog.showErrorBox('Error Reading Credentials', "Unable to read credentials file: " + err);
      return;
    }

    // Authorize a client with credentials, then call the Google Sheets API.
    const {client_secret, client_id, redirect_uris} = JSON.parse(content).installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        getNewToken(oAuth2Client);
      } else {
        oAuth2Client.setCredentials(JSON.parse(token));
        getAndSendSheetsURL();
      }
    });
  });
}

function isMac() {
  return process.platform === 'darwin';
}

function makeShortcut(command) {
  return (isMac() ? 'Command' : 'Ctrl') + "+" + command;
}

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Load Scores from File',
        // accelerator: makeShortcut("O"),
        click() {
          loadScoresFromFile();
        }
      },
      {
        label: 'Load Scores from Google Sheets',
        accelerator: makeShortcut("O"),
        click() {
          loadScoresFromSheets();
        }
      },
      {
        label: 'Quit',
        accelerator: makeShortcut("Q"),
        click() {
          app.quit();
        }
      }
    ]
  }
];

// If mac, add new first object to menu
if (isMac()) {
  mainMenuTemplate.unshift({
    label: app.name,
    submenu: [
      {role: 'about'},
      {role: 'quit'}
    ]
  });

  // Edit menu
  mainMenuTemplate[1].submenu.pop(1);
}

// Add developers tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        role: 'toggledevtools'
      },
      {
        role: 'reload'
      }
    ]
  })
}
