scheduler.view = (function () {
    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };

    const display_raw = function (x) {
        $container.append(document.createTextNode(JSON.stringify(x)));
    };

    const _create_num_setting = function (settings, setting_key, setting_text) {
        let setting_container = document.createElement('div');

        let setting_elem = document.createElement('input');
        setting_elem.setAttribute("type", "number");
        setting_elem.setAttribute("step", "1");
        setting_elem.setAttribute("min", "0");
        setting_elem.value = settings[setting_key];

        $(setting_elem).change(function() {
            scheduler.controller.handle_setting_change(setting_key, parseInt(setting_elem.value));
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

        /***************************settings***************************/

        let settings_div = document.createElement('div');
        $container.append(settings_div);

        let settings = config.settings;

        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_INTERVIEW_PER_STUDENT,"Min Interviews per Student"));
        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.MAX_INTERVIEW_PER_STUDENT,"Max Interviews per Student"));
        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_INTERVIEW_PER_INTERVIEWER,"Min Interviews per Interviewer"));
        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT,"Max Interviews at Company per Student"));
        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_STUDENT_PREFS_GUARANTEED,"Min Student Preferences Guaranteed"));
        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.MIN_TEAM_PREFS_GUARANTEED_PER_POSITION,"Min Team Preferences Guaranteed per Position"));
        settings_div.appendChild(_create_bool_setting(settings, scheduler.constants.REQUIRE_MUTUAL_PREFS_TO_INTERVIEW,"Require Mutual Preferences to Interview"));
        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.TIME_WINDOW_SIZE,"Time Window Size"));
        settings_div.appendChild(_create_num_setting(settings, scheduler.constants.MAX_INTERVIEW_PER_TIME_WINDOW,"Max Interviews per Time Window per Student"));
        /***************************calculate button***************************/

        let calculate_div = document.createElement('div');
        $container.append(calculate_div);

        let calculate_button = document.createElement('button');
        calculate_div.appendChild(calculate_button);

        calculate_button.appendChild(document.createTextNode('Calculate Schedule!'));
        $(calculate_button).click(function() {
            scheduler.controller.handle_calculate_button_clicked();
        });
    };

    const _create_table_entry = function(content) {
        let table_entry = document.createElement('td');
        table_entry.appendChild(content);
        return table_entry;
    };

    const display_schedule = function (solved_model) {
        clear_container();

        let schedule_div = document.createElement('div');
        $container.append(schedule_div);

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

        h1.appendChild(document.createTextNode('Created Schedule with Score ' + solved_model.score));
        let schedule_table = document.createElement('table');
        schedule_div.appendChild(schedule_table);

        schedule_table.setAttribute("class", "tablesorter");
        let schedule_table_head = document.createElement('thead');
        schedule_table.append(schedule_table_head);

        let header_row = document.createElement('tr');
        schedule_table_head.appendChild(header_row);

        let col_names = ['student name', 'company name', 'team name', 'interviewer name', 'timeslot',
            'is student preference?', 'is team preference?', 'score', 'override'];
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
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].score)));
            row.appendChild(_create_table_entry(document.createTextNode(solved_model.schedule[i].is_override)));
            schedule_table_body.appendChild(row);
        }

        $(schedule_table).tablesorter();

    };

    return {
        init_module: init_module,
        display_configs: display_configs,
        display_schedule: display_schedule,
        display_raw: display_raw
    };
}());