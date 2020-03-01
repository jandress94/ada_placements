const { BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const {google} = require('googleapis');
const constants = require('./constants');
//
// // Keep a global reference of the window objects, if you don't, the window will
// // be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let oAuth2Client;
let googleAuthWindow;
let googleSheetsURLWindow;

const init = function(mW) {
    mainWindow = mW;
};

const _load_scores_from_file = function () {
  dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  }).then(result => {
    if (!result.canceled) {
      // send the filepath to the placements page
      mainWindow.webContents.send('placement.loadScoresFromFile', result.filePaths[0]);
    }
  });
};

ipcMain.on('authCode', (event, authCode) => {
  googleAuthWindow.close();

  oAuth2Client.getToken(authCode, (err, token) => {
    if (err) {
      dialog.showErrorBox('Error Authenticating', "The provided authentication code was incorrect.");
      return
    }
    // Store the token to disk for later program executions
    fs.writeFile(constants.TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', constants.TOKEN_PATH);
    });
    createGoogleSheetsURLWindow();
  });
});

ipcMain.on('sheetURL', (event, sheetURL) => {
  googleSheetsURLWindow.close();
  mainWindow.webContents.send('placement.loadScoresFromSheets', sheetURL);
});

const _createGoogleSheetsURLWindow = function () {
  // Create the browser window.
  googleSheetsURLWindow = new BrowserWindow({
    width: 400,
    height: 200,
    title: 'Google Sheet URL',
    webPreferences: {
      nodeIntegration: true
    }
  });

  googleSheetsURLWindow.loadFile(path.join(path.dirname(__dirname), '..', 'html', 'placement', 'googleSheetURL.html'));

  // garbage collection
  googleSheetsURLWindow.on('close', function() {
    googleSheetsURLWindow = null;
  });
};

const _createAuthWindow = function(authUrl) {
  // Create the browser window.
  googleAuthWindow = new BrowserWindow({
    width: 400,
    height: 200,
    title: 'Google Authentication',
    webPreferences: {
      nodeIntegration: true
    }
  });

  googleAuthWindow.loadFile(path.join(path.dirname(__dirname), '..', 'html', 'placement', 'googleAuth.html')).then(value => {
    googleAuthWindow.webContents.send('authUrl', authUrl);
  });

  // garbage collection
  googleAuthWindow.on('close', function() {
    googleAuthWindow = null;
  });
};

const _getNewToken = function(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  _createAuthWindow(authUrl);
};

const _load_scores_from_sheets = function () {
  fs.readFile(constants.GOOGLE_CREDENTIALS_PATH, (err, content) => {
    if (err) {
      dialog.showErrorBox('Error Reading Credentials', "Unable to read credentials file: " + err);
      return;
    }

    // Authorize a client with credentials, then call the Google Sheets API.
    const {client_secret, client_id, redirect_uris} = JSON.parse(content).installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    if (fs.existsSync(constants.TOKEN_PATH)) {
      _createGoogleSheetsURLWindow();
    } else {
      _getNewToken(oAuth2Client);
    }
  });
};

const get_menu_items = function() {
    return [
        {
            label: 'Placements',
            submenu: [
                {
                    label: 'Load Scores from File',
                    click() {
                        _load_scores_from_file();
                    }
                },
                {
                    label: 'Load Scores from Google Sheets',
                    click() {
                        _load_scores_from_sheets();
                    }
                }
            ]
        }
    ];
};

const close = function() {
    if (googleAuthWindow) {
        googleAuthWindow.close();
        googleAuthWindow = null;
    }
    if (googleSheetsURLWindow) {
        googleSheetsURLWindow.close();
        googleSheetsURLWindow = null;
    }
};

module.exports = {
    init: init,
    get_menu_items: get_menu_items,
    close: close
};