scheduler.controller = (function () {
    const handle_load_config_json = function (configUrl) {
        scheduler.model.load_config_json(configUrl);
        display_config_page();
    };

    const display_config_page = function() {
        scheduler.view.display_configs(scheduler.model.get_config());
    };

    const handle_calculate_button_clicked = function() {
        scheduler.view.clear_container();
        scheduler.model.get_solved_model()
            .then(function(solved_model) {
                scheduler.view.display_schedule(solved_model)
            })
            .catch(function (err) {
                alert(err);
                scheduler.view.display_configs(scheduler.model.get_config());
            });
    };

    const handle_setting_change = function (setting_key, new_val) {
        scheduler.model.update_setting(setting_key, new_val);
    };

    const handle_back_to_configs_button_clicked = function () {
        scheduler.view.display_configs(scheduler.model.get_config())
    };

    const handle_overwrite_changed = function (student_name, team_name, new_val) {
        scheduler.model.update_overwrite(student_name, team_name, new_val);
    };

    return {
        handle_load_config_json: handle_load_config_json,
        handle_calculate_button_clicked: handle_calculate_button_clicked,
        handle_setting_change: handle_setting_change,
        handle_back_to_configs_button_clicked: handle_back_to_configs_button_clicked,
        handle_overwrite_changed: handle_overwrite_changed,
        display_config_page: display_config_page
    };
}());