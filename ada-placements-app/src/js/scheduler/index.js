const { dialog } = require('electron');
const fs = require('fs');

// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const init = function(mW) {
    mainWindow = mW;
};

const _load_config_json = function () {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
    }).then(result => {
        if (!result.canceled) {
            // send the config filepath to the scheduler page
            mainWindow.webContents.send('scheduler.loadConfigJSON', result.filePaths[0]);
        }
    });
};

const get_menu_items = function() {
    return [
        {
            label: 'Scheduler',
            submenu: [
                {
                    label: 'Load Config JSON',
                    click() {
                        _load_config_json();
                    }
                }
            ]
        }
    ];
};

const close = function() { };

module.exports = {
    init: init,
    get_menu_items: get_menu_items,
    close: close
};