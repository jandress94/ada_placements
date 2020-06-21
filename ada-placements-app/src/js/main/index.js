const { app, BrowserWindow, Menu } = require('electron');
const contextMenu = require('electron-context-menu');
const path = require('path');

const placement_main = require('./placement');
const scheduler_main = require('./scheduler');


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

ada_modules = [scheduler_main, placement_main];

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  for (let i = 0; i < ada_modules.length; i++) {
    ada_modules[i].init(mainWindow);
  }

  mainWindow.setMenuBarVisibility(true);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(path.dirname(__dirname), '..', 'html', 'index.html'));

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;

    for (let i = 0; i < ada_modules.length; i++) {
      ada_modules[i].close();
    }
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

const _view_landing = function () {
    mainWindow.webContents.send('landing.view');
};

const mainMenuTemplate = [
  {
    label: app.name,
    submenu: [
      {
          label: 'View Landing Page',
          click() {
              _view_landing();
          }
      },
      {role: 'about'},
      {role: 'quit'}
    ]
  }
];
for (let i = 0; i < ada_modules.length; i++) {
  mainMenuTemplate.push(...ada_modules[i].get_menu_items());
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
  });
}
