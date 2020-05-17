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
            .then(scheduler.view.display_schedule)
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

    const handle_save_to_sheet = function () {
        scheduler.model.save_schedule_to_sheets()
        // TODO: if this is where you first set up the google creds/tokens, it won't switch back to the schedule after authorizing.
            .then(spreadsheetId => alert('Saved interview schedule to spreadsheet ' + spreadsheetId))
            .catch(alert);
    };

    const handle_save_to_csv = function () {
        scheduler.model.save_schedule_to_csv()
            .then(save_state => {
                if (save_state.state === 'success') {
                    alert("Save successful");
                }
            })
            .catch(err => alert(err));
    };

    const handle_save_config_button_clicked = function () {
        scheduler.model.save_config_to_file()
            .then(save_state => {
                if (save_state.state === 'success') {
                    alert("Save successful");
                }
            })
            .catch(alert);
    };

    return {
        get_landing_generator_fn: get_landing_generator_fn,
        handle_load_file: handle_load_file,
        handle_calculate_button_clicked: handle_calculate_button_clicked,
        handle_setting_change: handle_setting_change,
        handle_back_to_configs_button_clicked: handle_back_to_configs_button_clicked,
        handle_overwrite_changed: handle_overwrite_changed,
        display_config_page: display_config_page,
        handle_save_to_sheet: handle_save_to_sheet,
        handle_save_to_csv: handle_save_to_csv,
        handle_save_config_button_clicked: handle_save_config_button_clicked
    };
}());