// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const init = function(mW) {
    mainWindow = mW;
};

const _load_scores_from_file = function () {
    mainWindow.webContents.send('placement.loadScoresFile');
};

const _load_scores_from_sheets = function () {
    mainWindow.webContents.send('placement.loadScoresSheet');
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

const close = function() { };

module.exports = {
    init: init,
    get_menu_items: get_menu_items,
    close: close
};