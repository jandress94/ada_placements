scheduler.controller = (function () {
    const get_landing_generator_fn = function () {
        return scheduler.view.get_landing_generator_fn();
    };

    const handle_load_file = function () {
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'JSON', extensions: ['json'] }]
        })
            .then(result => {
                if (!result.canceled) {
                    return fs.readFile(result.filePaths[0], 'utf8')
                            .then(JSON.parse)
                            .then(scheduler.model.set_config)
                            .then(display_config_page)
                            .catch(alert);
                }
            });
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

    const handle_save_sheets_button_clicked = function () {
        scheduler.model.save_schedule_to_sheets().then(function(successMsg) {
            alert(successMsg);
        }).catch(function(err) {
            alert(err);
        });
    };

    const handle_save_csv_button_clicked = function () {
        scheduler.model.save_schedule_to_csv()
            .then(save_state => {
                if (save_state.state === 'success') {
                    alert("Save successful");
                }
            })
            .catch(err => alert(err));
    };

    return {
        get_landing_generator_fn: get_landing_generator_fn,
        handle_load_file: handle_load_file,
        handle_calculate_button_clicked: handle_calculate_button_clicked,
        handle_setting_change: handle_setting_change,
        handle_back_to_configs_button_clicked: handle_back_to_configs_button_clicked,
        handle_overwrite_changed: handle_overwrite_changed,
        display_config_page: display_config_page,
        handle_save_sheets_button_clicked: handle_save_sheets_button_clicked,
        handle_save_csv_button_clicked: handle_save_csv_button_clicked
    };
}());