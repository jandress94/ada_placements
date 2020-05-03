util.io = (function () {
    let google_oAuth2Client;

    const init_module = function ($c) {
        util.io.view.init_module($c);
        google_oAuth2Client = null;

        util.io.constants = require('../js/renderer/util/io/constants');
    };

    const get_google_oAuth = function () {
        return new Promise((resolve, reject) => {
            if (google_oAuth2Client === null) {
                return fs.readFile(util.io.constants.GOOGLE_CREDENTIALS_PATH)
                    .then(credentials => {
                        const {client_secret, client_id, redirect_uris} = JSON.parse(credentials).installed;
                        google_oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
                        return resolve(google_oAuth2Client);
                    })
                    .catch(err => {
                        return reject('Error loading Google credentials file: ' + err);
                    });
            }

            return resolve(google_oAuth2Client);
        });
    };

    const sheet_url_to_sheet_id = function (sheetUrl) {
        if (sheetUrl.match(/^[a-zA-Z0-9-_]+$/g) != null) {
            return sheetUrl;
        } else {
            let matches = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (matches !== null && matches.length > 0) {
                return matches[1];
            }
        }
        return null;
    };

    const get_google_sheet_id = function () {
        return util.io.view.get_google_sheet_id()
            .then(result => {
                if (!result.canceled) {
                    let sheet_id = sheet_url_to_sheet_id(result.sheet_url);
                    if (sheet_id !== null) {
                        return {canceled: false, sheet_id: sheet_id};
                    } else {
                        return Promise.reject('The URL did not match the expected sheet id pattern');
                    }
                } else {
                    return {canceled: true};
                }
            });
    };

    const create_google_token = function (oAuth) {
        const auth_url = oAuth.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        return new Promise((resolve, reject) => {
            return util.io.view.get_auth_code(auth_url)
                .then(auth_code => {
                    return oAuth.getToken(auth_code, (err, token) => {
                        if (err) {
                            return reject(err);
                        }

                        return fs.writeFile(util.io.constants.TOKEN_PATH, JSON.stringify(token))
                            .then(resolve)
                            .catch(err => reject(err));
                    });
                });
        });
    };

    const get_google_token = function (oAuth) {
        return new Promise((resolve, reject) => {
            return fs.access(util.io.constants.TOKEN_PATH)
                .catch(() => {
                    return create_google_token(oAuth);
                })
                .catch(err => reject('Problem creating Google Token: ' + err))
                .then(() => {
                    return fs.readFile(util.io.constants.TOKEN_PATH)
                        .then(token_raw => resolve(JSON.parse(token_raw)))
                        .catch(err => reject('Problem reading Google Token: ' + err));
                });
        });
    };

    const load_google_sheet_data = function (sheet_id, range) {
        return get_google_oAuth()
            .then(oAuthClient => {
                return get_google_token(oAuthClient)
                    .then(token => {
                        oAuthClient.setCredentials(token);
                        return google.sheets({version: 'v4', auth: oAuthClient});
                    })
                    .then(sheets => sheets.spreadsheets.values.get({
                        spreadsheetId: sheet_id,
                        range: range
                    }))
                    .then(res => res.data.values);
            });
    };

    const save_to_file = function(filePath, data_fn) {
        return fs.writeFile(filePath, data_fn())
            .then(() => { return {state: 'success'} });
    };

    const save_to_csv = function(data_array_fn) {
        return dialog.showSaveDialog({
            filters: [
                { name: 'CSV', extensions: ['csv'] }
            ]
        }).then(result => {
            if (!result.canceled) {
                return save_to_file(result.filePath, () => convertArrayToCSV(data_array_fn()));
            } else {
                return {state: 'canceled'};
            }
        });
    };

    return {
        init_module: init_module,
        get_google_sheet_id: get_google_sheet_id,
        load_google_sheet_data: load_google_sheet_data,
        save_to_csv: save_to_csv
    }
}());