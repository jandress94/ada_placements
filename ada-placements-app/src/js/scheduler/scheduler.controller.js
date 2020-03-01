scheduler.controller = (function () {
    const handle_load_config_json = function (configUrl) {
        scheduler.model.load_config_json(configUrl);
        scheduler.view.display_raw(scheduler.model.get_config());
    };

    return {
        handle_load_config_json: handle_load_config_json
    };
}());