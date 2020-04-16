scheduler.controller = (function () {
    const handle_load_config_json = function (configUrl) {
        scheduler.model.load_config_json(configUrl);
        scheduler.view.display_configs(scheduler.model.get_config());
    };

    const handle_calculate_button_clicked = function() {
        let solved_model = scheduler.model.get_solved_model();
        scheduler.view.display_schedule(solved_model);
        // scheduler.view.display_raw(solved_model);
    };

    const handle_setting_change = function (setting_key, new_val) {
        scheduler.model.update_setting(setting_key, new_val);
    };

    const handle_back_to_configs_button_clicked = function () {
        scheduler.view.display_configs(scheduler.model.get_config())
    };

    return {
        handle_load_config_json: handle_load_config_json,
        handle_calculate_button_clicked: handle_calculate_button_clicked,
        handle_setting_change: handle_setting_change,
        handle_back_to_configs_button_clicked: handle_back_to_configs_button_clicked
    };
}());