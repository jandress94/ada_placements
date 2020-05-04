const APP_LOCALSTORAGE = path.join((electron.app || electron.remote.app).getPath('userData'), 'Local Storage');

const TOKEN_DIR = path.join(APP_LOCALSTORAGE, 'tokens');
fs.access(TOKEN_DIR).catch(() => fs.mkdir(TOKEN_DIR));

const TOKEN_PATH = path.join(TOKEN_DIR, 'token.json');

const GOOGLE_CREDENTIALS_DIR = path.join(APP_LOCALSTORAGE, 'google_creds');
fs.access(GOOGLE_CREDENTIALS_DIR).catch(() => fs.mkdir(GOOGLE_CREDENTIALS_DIR));

const GOOGLE_CREDENTIALS_PATH = path.join(GOOGLE_CREDENTIALS_DIR, 'credentials.json');

module.exports = {
    APP_LOCALSTORAGE: APP_LOCALSTORAGE,
    TOKEN_PATH: TOKEN_PATH,
    GOOGLE_CREDENTIALS_PATH: GOOGLE_CREDENTIALS_PATH
};