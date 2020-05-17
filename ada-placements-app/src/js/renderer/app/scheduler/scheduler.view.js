scheduler.view = (function () {
    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const get_landing_generator_fn = function () {
        return function () {
            let scheduler_div = document.createElement('div');

            let title_h1 = document.createElement('h1');
            title_h1.appendChild(document.createTextNode('Interview Scheduler'));
            scheduler_div.appendChild(title_h1);

            // Load from file
            let load_file_button = document.createElement('button');
            scheduler_div.appendChild(load_file_button);

            load_file_button.appendChild(document.createTextNode('Load Config JSON'));
            $(load_file_button).click(function() {
                scheduler.controller.handle_load_file();
            });

            return scheduler_div;
        };
    };

    const clear_container = function() {
        $container.empty();
    };

    const display_raw = function (x) {
        $container.append(document.createTextNode(JSON.stringify(x)));
    };

    const _create_num_setting = function (settings, setting_key, setting_text, step_val) {
        let setting_container = document.createElement('div');

        let setting_elem = document.createElement('input');
        setting_elem.setAttribute("type", "number");

        if (step_val === undefined) {
            step_val = "any";
        }
        setting_elem.setAttribute("step", step_val.toString());
        setting_elem.value = settings[setting_key];

        $(setting_elem).change(function() {
            scheduler.controller.handle_setting_change(setting_key, Number(setting_elem.value));
        });

        let setting_label = document.createElement("label");
        setting_label.setAttribute("for", setting_elem.id);
        setting_label.appendChild(document.createTextNode(setting_text));

        setting_container.appendChild(setting_elem);
        setting_container.appendChild(setting_label);

        return setting_container;
    };

    const _create_bool_setting = function (settings, setting_key, setting_text) {
        let setting_container = document.createElement('div');

        let setting_elem = document.createElement('input');
        setting_elem.setAttribute("type", "checkbox");
        setting_elem.checked = settings[setting_key];

        $(setting_elem).change(function() {
            scheduler.controller.handle_setting_change(setting_key, setting_elem.checked);
        });

        let setting_label = document.createElement("label");
        setting_label.setAttribute("for", setting_elem.id);
        setting_label.appendChild(document.createTextNode(setting_text));

        setting_container.appendChild(setting_elem);
        setting_container.appendChild(setting_label);

        return setting_container;
    };

    const display_configs = function (config) {
        clear_container();

        let timeslot_div = document.createElement('div');
        $container.append(timeslot_div);

        /***************************company config***************************/

        let company_div = document.createElement('div');
        $container.append(company_div);

        /***************************student config***************************/

        let student_div = document.createElement('div');
        $container.append(student_div);

        /***************************override config***************************/

        let override_div = document.createElement('div');
        $container.append(override_div);

        let override_h1 = document.createElement('h1');
        override_h1.appendChild(document.createTextNode('Overrides'));
        override_div.appendChild(override_h1);

        let override_table = document.createElement('table');
        override_div.appendChild(override_table);

        override_table.setAttribute('class', 'tablesorter');
        let override_table_head = document.createElement('thead');
        override_table.append(override_table_head);

        let header_row = document.createElement('tr');
        override_table_head.appendChild(header_row);

        let col_names = ['student name', 'team name', 'override value', ''];
        for (let i = 0; i < col_names.length; i++) {
            let column_name = col_names[i];
            let header = document.createElement('th');
            header.appendChild(document.createTextNode(column_name));
            header_row.appendChild(header);
        }

        let override_table_body = document.createElement('tbody');
        override_table.appendChild(override_table_body);

        const overrides = config.overrides;
        for (let i = 0; i < overrides.length; i++) {
            const over = overrides[i];

            let row = document.createElement('tr');
            row.appendChild(_create_table_entry(document.createTextNode(over.person)));
            row.appendChild(_create_table_entry(document.createTextNode(over.team)));
            row.appendChild(_create_table_entry(document.createTextNode(over.value)));

            let del_button = document.createElement('button');
            del_button.appendChild(document.createTextNode('Delete'));
            $(del_button).click(function() {
                scheduler.controller.handle_overwrite_changed(over.person, over.team, null);
                scheduler.controller.display_config_page();
            });
            row.appendChild(_create_table_entry(del_button));

            override_table_body.appendChild(row);
        }

        $(override_table).tablesorter();

        /***************************settings (constraints)***************************/

        let settings_div = document.createElement('div');
        $container.append(settings_div);

        let settings = config.settings;

        let constraint_div = document.createElement('div');
        settings_div.appendChild(constraint_div);

        let constraints_h1 = document.createElement('h1');
        constraints_h1.appendChild(document.createTextNode('Constraint Settings'));
        constraint_div.appendChild(constraints_h1);
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_INTERVIEW_PER_STUDENT,"Min Interviews per Student", 1));
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MAX_INTERVIEW_PER_STUDENT,"Max Interviews per Student", 1));
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_INTERVIEW_PER_INTERVIEWER,"Min Interviews per Interviewer", 1));
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT,"Max Interviews at Company per Student", 1));
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_STUDENT_PREFS_GUARANTEED,"Min Student Preferences Guaranteed", 1));
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_TEAM_PREFS_GUARANTEED_PER_POSITION,"Min Team Preferences Guaranteed per Position", 1));
        constraint_div.appendChild(_create_bool_setting(settings, scheduler.constants.REQUIRE_MUTUAL_PREFS_TO_INTERVIEW,"Require Mutual Preferences to Interview"));
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.TIME_WINDOW_SIZE,"Time Window Size", 1));
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MAX_INTERVIEW_PER_TIME_WINDOW,"Max Interviews per Time Window per Student", 1));

        /***************************settings (scoring)***************************/

        let scoring_div = document.createElement('div');
        settings_div.appendChild(scoring_div);

        let scoring_h1 = document.createElement('h1');
        scoring_h1.appendChild(document.createTextNode('Scoring Settings'));
        scoring_div.appendChild(scoring_h1);
        // Todo: change strings
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.DIFFICULTY_DIFF_2_SCORE,"Student - Team Difficulty Score 2"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.DIFFICULTY_DIFF_1_SCORE,"Student - Team Difficulty Score 1"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.DIFFICULTY_DIFF_0_SCORE,"Student - Team Difficulty Score 0"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.DIFFICULTY_DIFF_MINUS1_SCORE,"Student - Team Difficulty Score -1"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.DIFFICULTY_DIFF_MINUS2_SCORE,"Student - Team Difficulty Score -2"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.IS_STUDENT_PREF_SCORE,"Student Preference Score"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.IS_TEAM_PREF_SCORE,"Team Preference Score"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.IS_MUTUAL_PREF_SCORE,"Mutual Preference Score"));
        scoring_div.appendChild(_create_num_setting(settings, scheduler.constants.RANDOM_SCORE_MAX, "Max Random Score"));
        /***************************calculate button***************************/

        let calculate_div = document.createElement('div');
        $container.append(calculate_div);

        let calculate_button = document.createElement('button');
        calculate_div.appendChild(calculate_button);

        calculate_button.appendChild(document.createTextNode('Calculate Schedule!'));
        $(calculate_button).click(function() {
            scheduler.controller.handle_calculate_button_clicked();
        });

        /****************************save config button****************************/
        let save_config_div = document.createElement('div');
        $container.append(save_config_div);

        let save_config_button = document.createElement('button');
        save_config_div.appendChild(save_config_button);

        save_config_button.appendChild(document.createTextNode('Save Config'));
        $(save_config_button).click(function () {
            scheduler.controller.handle_save_config_button_clicked();
        });
    };

    const _create_table_entry = function(content) {
        let table_entry = document.createElement('td');
        table_entry.appendChild(content);
        return table_entry;
    };

    const _create_overwrite_select = function(schedule_obj) {
        let overwrite_select = document.createElement('select');
        $(overwrite_select).change(function() {
            let new_val = JSON.parse($(overwrite_select).find('option:selected').val());
            scheduler.controller.handle_overwrite_changed(schedule_obj.student_name, schedule_obj.team_name, new_val);
        });

        let blank_option = document.createElement('option');
        blank_option.setAttribute('value', null);
        overwrite_select.appendChild(blank_option);

        let yes_option = document.createElement('option');
        yes_option.setAttribute('value', true);
        yes_option.appendChild(document.createTextNode('Yes'));
        overwrite_select.appendChild(yes_option);

        let no_option = document.createElement('option');
        no_option.setAttribute('value', false);
        no_option.appendChild(document.createTextNode('No'));
        overwrite_select.appendChild(no_option);

        if (schedule_obj.is_override === null) {
            blank_option.setAttribute('selected', 'selected');
        } else if (schedule_obj.is_override) {
            yes_option.setAttribute('selected', 'selected');
        } else if (!schedule_obj.is_override) {
            no_option.setAttribute('selected', 'selected');
        } else {
            throw "Unknown overwrite value: " + schedule_obj.overwrite;
        }

        return overwrite_select;
    };

    const display_schedule = function (solved_model) {
        clear_container();

        let schedule_div = document.createElement('div');
        $container.append(schedule_div);

        let recompute_div = document.createElement('div');
        $container.append(recompute_div);

        let save_div = document.createElement('div');
        $container.append(save_div);

        // Back
        let back_div = document.createElement('div');
        $container.append(back_div);

        let back_button = document.createElement('button');
        back_div.appendChild(back_button);

        back_button.appendChild(document.createTextNode('Back to Configs'));
        $(back_button).click(function() {
            scheduler.controller.handle_back_to_configs_button_clicked();
        });

        let h1 = document.createElement('h1');
        schedule_div.appendChild(h1);

        if (!solved_model.is_feasible) {
            h1.appendChild(document.createTextNode('No schedule possible.'));
            return;
        }

        // Recompute
        let recompute_button = document.createElement('button');
        recompute_div.appendChild(recompute_button);

        recompute_button.appendChild(document.createTextNode('Recompute Schedule'));
        $(recompute_button).click(function() {
            scheduler.controller.handle_calculate_button_clicked();
        });

        // Saving
        let save_sheets_button = document.createElement('button');
        save_div.appendChild(save_sheets_button);

        save_sheets_button.appendChild(document.createTextNode('Save to Google Sheets'));
        $(save_sheets_button).click(function() {
            scheduler.controller.handle_save_to_sheet();
        });

        let save_csv_button = document.createElement('button');
        save_div.appendChild(save_csv_button);

        save_csv_button.appendChild(document.createTextNode('Save to CSV File'));
        $(save_csv_button).click(function() {
            scheduler.controller.handle_save_to_csv();
        });

        h1.appendChild(document.createTextNode('Created Schedule with Score ' + solved_model.score));
        let schedule_table = document.createElement('table');
        schedule_div.appendChild(schedule_table);

        schedule_table.setAttribute("class", "tablesorter");
        let schedule_table_head = document.createElement('thead');
        schedule_table.append(schedule_table_head);

        let header_row = document.createElement('tr');
        schedule_table_head.appendChild(header_row);

        let col_names = ['student name', 'company name', 'team name', 'interviewer name', 'timeslot',
            'is student preference?', 'is team preference?', 'student - team difficulty', 'score', 'override'];
        for (let i = 0; i < col_names.length; i++) {
            let column_name = col_names[i];
            let header = document.createElement('th');
            header.appendChild(document.createTextNode(column_name));
            header_row.appendChild(header);
        }

        let schedule_table_body = document.createElement('tbody');
        schedule_table.appendChild(schedule_table_body);
        for (let i = 0; i < solved_model.schedule.length; i++) {
            let row = document.createElement('tr');
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].student_name)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].company_name)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].team_name)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].interviewer_name)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].timeslot)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].is_student_pref)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].is_team_pref)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].difficulty_diff)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].score)));
            row.appendChild(_create_table_entry(_create_overwrite_select(solved_model.schedule[i])));
            schedule_table_body.appendChild(row);
        }

        $(schedule_table).tablesorter();
    };

    return {
        init_module: init_module,
        get_landing_generator_fn: get_landing_generator_fn,
        clear_container: clear_container,
        display_configs: display_configs,
        display_schedule: display_schedule,
        display_raw: display_raw
    };
}());