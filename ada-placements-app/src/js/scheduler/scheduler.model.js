scheduler.model = (function () {
    let config;

    const init_module = function () {
        config = null;
    };

    const load_config_json = function (configUrl) {
        config = JSON.parse(fs.readFileSync(configUrl, 'utf8'));
    };

    const get_config = function () {
        return config;
    };

    return {
        init_module: init_module,
        load_config_json: load_config_json,
        get_config: get_config
    };
}());