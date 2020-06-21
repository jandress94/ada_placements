placement.controller = (function () {
    const get_landing_generator_fn = function () {
        return placement.view.get_landing_generator_fn();
    };

    const handle_load_file = function () {
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'CSV', extensions: ['csv'] }]
        })
            .then(result => {
                if (!result.canceled) {
                    return fs.readFile(result.filePaths[0], 'utf8')
                        .then(data_csv_raw => parse(data_csv_raw.toString(), {
                            cast: true,
                            columns: false,
                            skip_empty_lines: true
                        }))
                        .then(placement.model.load_scores_from_array)
                        .then(() => placement.view.display_scores_page(placement.model.get_scores(), placement.model.get_settings()))
                        .catch(alert);
                }
            });
    };

    const handle_load_sheet = function () {
        util.io.get_google_sheet_id()
            .then(result => {
                if (!result.canceled) {
                    return util.io.load_google_sheet_data(result.sheet_id, 'A:E')
                        .then(placement.model.load_scores_from_array)
                        .then(() => placement.view.display_scores_page(placement.model.get_scores(), placement.model.get_settings()))
                        .catch(err => {
                            alert(err);
                            landing.start();
                        });
                } else {
                    landing.start();
                }
            })
            .catch(err => {
                alert(err);
                landing.start();
            });
    };

    const handle_overwrite_changed = function (score_id, new_val) {
        placement.model.update_overwrite(score_id, new_val);
    };

    const handle_calculate_button_clicked = function () {
        let solved_model = placement.model.get_solved_model();
        placement.view.display_placements_page(solved_model);
    };

    const handle_back_to_scores_button_clicked = function () {
        placement.view.display_scores_page(placement.model.get_scores(), placement.model.get_settings());
    };

    const handle_save_to_sheet = function () {
        placement.model.save_placements_to_sheet()
        // TODO: if this is where you first set up the google creds/tokens, it won't switch back to the schedule after authorizing.
            .then(spreadsheetid => alert('Saved placements to spreadsheet ' + spreadsheetid))
            .catch(alert);
    };

    const handle_save_to_csv = function () {
        placement.model.save_placements_to_csv()
            .then(save_state => {
                if (save_state.state === 'success') {
                    alert("Save successful");
                }
            })
            .catch(err => alert(err));
    };

    const handle_setting_change = function (setting_key, new_val) {
        placement.model.update_setting(setting_key, new_val);
    };

    return {
        get_landing_generator_fn: get_landing_generator_fn,
        handle_load_file: handle_load_file,
        handle_load_sheet: handle_load_sheet,
        handle_overwrite_changed: handle_overwrite_changed,
        handle_calculate_button_clicked: handle_calculate_button_clicked,
        handle_back_to_scores_button_clicked: handle_back_to_scores_button_clicked,
        handle_save_to_sheet: handle_save_to_sheet,
        handle_save_to_csv: handle_save_to_csv,
        handle_setting_change: handle_setting_change
    };
}());