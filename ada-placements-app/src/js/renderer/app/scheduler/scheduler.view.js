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

            // input instructions
            let instructions_div = document.createElement('div');
            scheduler_div.append(instructions_div);

            let instructions_button = document.createElement('button');
            instructions_div.appendChild(instructions_button);
            instructions_button.appendChild(document.createTextNode('Input Instructions'));

            $(instructions_button).click(function() {
                show_instructions_page();
            });

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

    const show_instructions_page = function() {
        clear_container();

        let instructions_div = document.createElement('div');
        $container.append(instructions_div);

        let title_h1 = document.createElement('h1');
        title_h1.appendChild(document.createTextNode('Interview Scheduler'));
        instructions_div.appendChild(title_h1);

        let info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode(
            "The input data for the interview scheduler is a JSON file giving the details about the interview timeslots, " +
            "the companies/teams/interviewers, the students, any overrides, and the constraints/scoring criteria. " +
            "You can go to \"https://jsonformatter.curiousconcept.com\" to validate that the JSON file is formatted correctly. " +
            "Here is an example of the JSON file: "
        ));

        let example_json_area = document.createElement('textarea');
        instructions_div.appendChild(example_json_area);

        example_json_area.setAttribute("rows", "16");
        example_json_area.setAttribute("cols", "100");
        example_json_area.value =
            "{\n" +
            "\t\"timeslots\": [\n" +
            "\t\t{\n" +
            "\t\t\t\"day\": \"Monday\",\n" +
            "\t\t\t\"times\": [\n" +
            "\t\t\t\t\"1\",\n" +
            "\t\t\t\t\"2\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"day\": \"Tuesday\",\n" +
            "\t\t\t\"times\": [\n" +
            "\t\t\t\t\"1\",\n" +
            "\t\t\t\t\"2\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"day\": \"Wednesday\",\n" +
            "\t\t\t\"times\": [\n" +
            "\t\t\t\t\"1\",\n" +
            "\t\t\t\t\"2\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"day\": \"Thursday\",\n" +
            "\t\t\t\"times\": [\n" +
            "\t\t\t\t\"1\",\n" +
            "\t\t\t\t\"2\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"day\": \"Friday\",\n" +
            "\t\t\t\"times\": [\n" +
            "\t\t\t\t\"1\",\n" +
            "\t\t\t\t\"2\"\n" +
            "\t\t\t]\n" +
            "\t\t}\n" +
            "\t],\n" +
            "\t\"companies\": [\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Ada Developers Academy\",\n" +
            "\t\t\t\"teams\": [\n" +
            "\t\t\t\t{\n" +
            "\t\t\t\t\t\"name\": \"Ada Developers Academy Team 1\",\n" +
            "\t\t\t\t\t\"positions\": 1,\n" +
            "\t\t\t\t\t\"difficulty\": 3,\n" +
            "\t\t\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\t\t\"Ada Lovelace\"\n" +
            "\t\t\t\t\t],\n" +
            "\t\t\t\t\t\"interviewers\": [\n" +
            "\t\t\t\t\t\t{\n" +
            "\t\t\t\t\t\t\t\"name\": \"Alice\",\n" +
            "\t\t\t\t\t\t\t\"timeslots\": [\n" +
            "\t\t\t\t\t\t\t\t\"Monday_1\",\n" +
            "\t\t\t\t\t\t\t\t\"Monday_2\"\n" +
            "\t\t\t\t\t\t\t]\n" +
            "\t\t\t\t\t\t}\n" +
            "\t\t\t\t\t]\n" +
            "\t\t\t\t},\n" +
            "\t\t\t\t{\n" +
            "\t\t\t\t\t\"name\": \"Ada Developers Academy Team 2\",\n" +
            "\t\t\t\t\t\"positions\": 1,\n" +
            "\t\t\t\t\t\"difficulty\": 1,\n" +
            "\t\t\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\t\t\"Moby\",\n" +
            "\t\t\t\t\t\t\"Emma\"\n" +
            "\t\t\t\t\t],\n" +
            "\t\t\t\t\t\"interviewers\": [\n" +
            "\t\t\t\t\t\t{\n" +
            "\t\t\t\t\t\t\t\"name\": \"Bob\",\n" +
            "\t\t\t\t\t\t\t\"timeslots\": [\n" +
            "\t\t\t\t\t\t\t\t\"Tuesday_1\",\n" +
            "\t\t\t\t\t\t\t\t\"Tuesday_2\"\n" +
            "\t\t\t\t\t\t\t]\n" +
            "\t\t\t\t\t\t}\n" +
            "\t\t\t\t\t]\n" +
            "\t\t\t\t}\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Lirio, LLC\",\n" +
            "\t\t\t\"teams\": [\n" +
            "\t\t\t\t{\n" +
            "\t\t\t\t\t\"name\": \"Lirio Team 1\",\n" +
            "\t\t\t\t\t\"positions\": 2,\n" +
            "\t\t\t\t\t\"difficulty\": 2,\n" +
            "\t\t\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\t\t\"Jim\",\n" +
            "\t\t\t\t\t\t\"Ada Lovelace\",\n" +
            "\t\t\t\t\t\t\"Emma\"\n" +
            "\t\t\t\t\t],\n" +
            "\t\t\t\t\t\"interviewers\": [\n" +
            "\t\t\t\t\t\t{\n" +
            "\t\t\t\t\t\t\t\"name\": \"Carla\",\n" +
            "\t\t\t\t\t\t\t\"timeslots\": [\n" +
            "\t\t\t\t\t\t\t\t\"Friday_1\",\n" +
            "\t\t\t\t\t\t\t\t\"Friday_2\"\n" +
            "\t\t\t\t\t\t\t]\n" +
            "\t\t\t\t\t\t},\n" +
            "\t\t\t\t\t\t{\n" +
            "\t\t\t\t\t\t\t\"name\": \"Daniel\",\n" +
            "\t\t\t\t\t\t\t\"timeslots\": [\n" +
            "\t\t\t\t\t\t\t\t\"Thursday_1\",\n" +
            "\t\t\t\t\t\t\t\t\"Thursday_2\"\n" +
            "\t\t\t\t\t\t\t]\n" +
            "\t\t\t\t\t\t}\n" +
            "\t\t\t\t\t]\n" +
            "\t\t\t\t}\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Acme Corporation\",\n" +
            "\t\t\t\"teams\": [\n" +
            "\t\t\t\t{\n" +
            "\t\t\t\t\t\"name\": \"Acme Team 1\",\n" +
            "\t\t\t\t\t\"positions\": 1,\n" +
            "\t\t\t\t\t\"difficulty\": 2,\n" +
            "\t\t\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\t\t\"Alan Turing\"\n" +
            "\t\t\t\t\t],\n" +
            "\t\t\t\t\t\"interviewers\": [\n" +
            "\t\t\t\t\t\t{\n" +
            "\t\t\t\t\t\t\t\"name\": \"Ellen\",\n" +
            "\t\t\t\t\t\t\t\"timeslots\": [\n" +
            "\t\t\t\t\t\t\t\t\"Wednesday_1\",\n" +
            "\t\t\t\t\t\t\t\t\"Wednesday_2\"\n" +
            "\t\t\t\t\t\t\t]\n" +
            "\t\t\t\t\t\t}\n" +
            "\t\t\t\t\t]\n" +
            "\t\t\t\t}\n" +
            "\t\t\t]\n" +
            "\t\t}\n" +
            "\t],\n" +
            "\t\"students\": [\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Jim\",\n" +
            "\t\t\t\"difficulty\": 2,\n" +
            "\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\"Ada Developers Academy Team 2\",\n" +
            "\t\t\t\t\"Lirio Team 1\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Emma\",\n" +
            "\t\t\t\"difficulty\": 2,\n" +
            "\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\"Ada Developers Academy Team 1\",\n" +
            "\t\t\t\t\"Lirio Team 1\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Moby\",\n" +
            "\t\t\t\"difficulty\": 1,\n" +
            "\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\"Lirio Team 1\",\n" +
            "\t\t\t\t\"Acme Team 1\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Ada Lovelace\",\n" +
            "\t\t\t\"difficulty\": 3,\n" +
            "\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\"Ada Developers Academy Team 1\",\n" +
            "\t\t\t\t\"Ada Developers Academy Team 2\"\n" +
            "\t\t\t]\n" +
            "\t\t},\n" +
            "\t\t{\n" +
            "\t\t\t\"name\": \"Alan Turing\",\n" +
            "\t\t\t\"difficulty\": 3,\n" +
            "\t\t\t\"preferences\": [\n" +
            "\t\t\t\t\"Acme Team 1\",\n" +
            "\t\t\t\t\"Ada Developers Academy Team 2\"\n" +
            "\t\t\t]\n" +
            "\t\t}\n" +
            "\t],\n" +
            "\t\"overrides\": [\n" +
            "\t\t{\n" +
            "\t\t\t\"person\": \"Jim\",\n" +
            "\t\t\t\"team\": \"Lirio Team 1\",\n" +
            "\t\t\t\"value\": true\n" +
            "\t\t}\n" +
            "\t],\n" +
            "\t\"settings\": {\n" +
            "\t\t\"max_interviews_per_student\": 2,\n" +
            "\t\t\"min_interviews_per_student\": 2,\n" +
            "\t\t\"min_interviews_per_interviewer\": 2,\n" +
            "\t\t\"max_interviews_at_company_per_student\": 2,\n" +
            "\t\t\"min_student_prefs_guaranteed\": 1,\n" +
            "\t\t\"min_team_prefs_guaranteed_per_position\": 1,\n" +
            "\t\t\"require_mutual_pres_to_interview\": true,\n" +
            "\t\t\"time_window_size\": 2,\n" +
            "\t\t\"max_interviews_per_time_window\": 1,\n" +
            "\t\t\"max_interviews_per_day\": 3,\n" +
            "\t\t\"difficulty_diff_2_score\": 5,\n" +
            "\t\t\"difficulty_diff_1_score\": 1,\n" +
            "\t\t\"difficulty_diff_0_score\": 0,\n" +
            "\t\t\"difficulty_diff_minus1_score\": -5,\n" +
            "\t\t\"difficulty_diff_minus2_score\": -25,\n" +
            "\t\t\"is_student_pref_score\": 1,\n" +
            "\t\t\"is_team_pref_score\": 4,\n" +
            "\t\t\"is_mutual_pref_score\": 6,\n" +
            "\t\t\"random_score_max\": 0\n" +
            "\t}\n" +
            "}";

        info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode("Information about the various sections is below."));

        let info_ul = document.createElement('ul');
        instructions_div.appendChild(info_ul);

        info_ul.innerHTML =
            "<li>timeslots</li>" +
            "   <ul>" +
            "       <li>a list of object, each of which is one day of interviews</li>" +
            "       <li>each timeslot object should have a \"day\" field giving the name of the day</li>" +
            "       <li>each timeslot object should have a \"times\" field which is a list of identifiers for the individual timeslots on that day</li>" +
            "   </ul>" +
            "<li>companies</li>" +
            "   <ul>" +
            "       <li>a list of object, each of which is one company doing interviews</li>" +
            "       <li>each company object should have a \"name\" field giving the name of the company</li>" +
            "       <li>each company object should have a \"teams\" field which is a list of team objects</li>" +
            "       <ul>" +
            "           <li>each team object should have a \"name\" field giving the name of the team</li>" +
            "           <li>each team object should have a \"positions\" field which is how many interns that company plans to accept</li>" +
            "           <li>each team object should have a \"difficulty\" field which is a numerical score indicating how hard the team is (larger number means more difficult team)</li>" +
            "           <li>each team object should have a \"preferences\" field which is a list of the students the team wants to interview (this list can be empty if the team has no preferences). " +
            "               The entries should exactly match the name of a student defined below.</li>" +
            "           <li>each team object should have a \"interviewers\" field which is a list of interviewer objects</li>" +
            "           <ul>" +
            "               <li>each interviewer object should have a \"name\" field giving the name of the interviewer</li>" +
            "               <li>each interviewer object should have a \"timeslots\" field which is a list of the timeslots the interviewer will be interviewing during. " +
            "                   Each entry should be of the form \"d_id\" where \"d\" is the \"day\" value from one of the timeslot objects " +
            "                   and \"id\" is one of the values from that day's \"times\" field.</li>" +
            "           </ul>" +
            "       </ul>" +
            "   </ul>" +
            "<li>students</li>" +
            "   <ul>" +
            "       <li>a list of object, each of which is one student being interviewed</li>" +
            "       <li>each student object should have a \"name\" field giving the name of that student</li>" +
            "       <li>each student object should have a \"difficulty\" field which is a numerical score indicating that student's strength (larger number means stronger student)</li>" +
            "       <li>each student object should have a \"preferences\" field which is a list of the teams the student wants to interview with (this list can be empty if the student has no preferences). " +
            "           The entries should exactly match the name of a team defined above.</li>" +
            "   </ul>" +
            "<li>overrides</li>" +
            "   <ul>" +
            "       <li>a list of object, each of which is one override between a student and team interviewing</li>" +
            "       <li>each override object should have a \"person\" field giving the name of the student. This must exactly match the name of a student defined above.</li>" +
            "       <li>each override object should have a \"team\" field giving the name of the team. This must exactly match the name of a team defined above.</li>" +
            "       <li>each override object should have a \"value\" field which is either true or false. " +
            "           If true the student must interview with the team, and if false the student cannot interview with the team.</li>" +
            "   </ul>" +
            "<li>settings</li>" +
            "   <ul>" +
            "       <li>an object containing various settings for the constraints and scoring. This entire object, as well as each entry, is optional and will use default values if excluded.</li>" +
            "       <li>max_interviews_per_student: each student can interview at most this many times</li>" +
            "       <li>min_interviews_per_interviewer: each interviewer in each team must interview at least this many students</li>" +
            "       <li>max_interviews_at_company_per_student: each student can interview at each company at most this many times</li>" +
            "       <li>min_student_prefs_guaranteed: each student is guaranteed to interview with this many of their preferences (assuming they have that many preferences which aren't overridden)</li>" +
            "       <li>min_team_prefs_guaranteed_per_position: each team is guaranteed to interview with this many of their preferences per internship position (assuming they have that many preferences which aren't overridden)</li>" +
            "       <li>require_mutual_pres_to_interview: if true, each time a student and team both list each other in their preferences, that interview will be required.</li>" +
            "       <li>time_window_size: the number of consecutive interview slots per day to consider one time window</li>" +
            "       <li>max_interviews_per_time_window: the maximum number of interviews a student can have in any time window. " +
            "           For example, if the \"time_window_size\" is 2 and the \"max_interviews_per_time_window\" is 1, that means no student can have back-to-back interviews (they can only have 1 interview in a group of 2 consecutive interview slots). " +
            "           If the \"time_window_size\" is 3 and the \"max_interviews_per_time_window\" is 2, that means that in any group of three consecutive interview slots, each student can interview at most twice.</li>" +
            "       <li>max_interviews_per_day: the maximum number of interviews each student can have per day</li>" +
            "       <li>difficulty_diff_2_score: Any time there is an interview where the student difficulty minus the team difficulty is equal to 2, this value will be added to the total score for the interview schedule</li>" +
            "       <li>difficulty_diff_1_score: Any time there is an interview where the student difficulty minus the team difficulty is equal to 1, this value will be added to the total score for the interview schedule</li>" +
            "       <li>difficulty_diff_0_score: Any time there is an interview where the student difficulty minus the team difficulty is equal to 0, this value will be added to the total score for the interview schedule</li>" +
            "       <li>difficulty_diff_minus1_score: Any time there is an interview where the student difficulty minus the team difficulty is equal to -1, this value will be added to the total score for the interview schedule</li>" +
            "       <li>difficulty_diff_minus2_score: Any time there is an interview where the student difficulty minus the team difficulty is equal to -2, this value will be added to the total score for the interview schedule</li>" +
            "       <li>is_student_pref_score: Any time a student interviews at one of their preferences, this value will be added to the total score for the interview schedule</li>" +
            "       <li>is_team_pref_score: Any time a team interviews with one of their preferences, this value will be added to the total score for the interview schedule</li>" +
            "       <li>is_mutual_pref_score: Any time there is an interview which is both a student and team preference, this value will be added to the total score for the interview schedule</li>" +
            "       <li>random_score_max: For each interview, a random score of at most this value will be added. This allows you to rerun with the same settings and break any ties in a different way. " +
            "           Set to 0 for no added randomness, or a very small value (0.01) for this tie-breaking behavior.</li>" +
            "   </ul>"
        ;

        // back to landing
        let back_div = document.createElement('div');
        $container.append(back_div);

        let back_button = document.createElement('button');
        back_div.appendChild(back_button);

        back_button.appendChild(document.createTextNode('Back...'));
        $(back_button).click(function() {
            landing.start();
        });
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
        constraint_div.appendChild(_create_num_setting(settings, scheduler.constants.MAX_INTERVIEWS_PER_DAY, "Max Interviews per Day per Student", 1));

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