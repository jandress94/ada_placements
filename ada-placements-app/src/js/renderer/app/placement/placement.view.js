placement.view = (function () {
    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const get_landing_generator_fn = function () {
        return function () {
            let placement_div = document.createElement('div');

            let title_h1 = document.createElement('h1');
            title_h1.appendChild(document.createTextNode('Internship Placements'));
            placement_div.appendChild(title_h1);

            // input instructions
            let instructions_div = document.createElement('div');
            placement_div.append(instructions_div);

            let instructions_button = document.createElement('button');
            instructions_div.appendChild(instructions_button);
            instructions_button.appendChild(document.createTextNode('Input Instructions'));

            $(instructions_button).click(function() {
                show_instructions_page();
            });

            // Load from file
            let load_file_button = document.createElement('button');
            placement_div.appendChild(load_file_button);

            load_file_button.appendChild(document.createTextNode('Load Scores from File'));
            $(load_file_button).click(function() {
                placement.controller.handle_load_file();
            });

            // Load from sheet
            let load_sheet_button = document.createElement('button');
            placement_div.appendChild(load_sheet_button);

            load_sheet_button.appendChild(document.createTextNode('Load Scores from Google Sheet'));
            $(load_sheet_button).click(function() {
                placement.controller.handle_load_sheet();
            });

            return placement_div;
        };
    };

    const show_instructions_page = function() {
        clear_container();

        let instructions_div = document.createElement('div');
        $container.append(instructions_div);

        let title_h1 = document.createElement('h1');
        title_h1.appendChild(document.createTextNode('Internship Placements'));
        instructions_div.appendChild(title_h1);

        let info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode("The input data should have the following columns, in this order:"));

        let column_ul = document.createElement('ul');
        instructions_div.appendChild(column_ul);

        column_ul.innerHTML =
            "<li>Student Name</li>" +
            "<li>Team Name</li>" +
            "<li>Student Score</li>" +
            "<li>Team Score</li>";

        info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode("There can also be a fifth column \"Overrides\" which contains a true/false value."));

        let multiple_positions_title_h2 = document.createElement('h2');
        multiple_positions_title_h2.appendChild(document.createTextNode('Teams with Multiple Positions'));
        instructions_div.appendChild(multiple_positions_title_h2);

        info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode(
            "One detail to point out is how to properly handle teams which have multiple positions. " +
            "In order for there to be a placement, the input must contain the same number of unique student names and team names. " +
            "Suppose we had four students and three companies, one of which was taking two students. " +
            "Each student interviewed with two teams. " +
            "In this scenario, the raw scores data would look like the following:"
        ));

        let demo_score_table = document.createElement('table');
        instructions_div.appendChild(demo_score_table);

        demo_score_table.innerHTML =
            "<thead>" +
            "   <tr>" +
            "       <th>Student Name</th>" +
            "       <th>Team Name</th>" +
            "       <th>Student Score</th>" +
            "       <th>Team Score</th>" +
            "   </tr>" +
            "</thead>" +
            "<tbody>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>2</td>" +
            "       <td>3</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Emma</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Emma</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>4</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>5</td>" +
            "       <td>1</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Ada Lovelace</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>2</td>" +
            "       <td>3</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Ada Lovelace</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "</tbody>";

        info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode(
            "As is, the system will not be able to create a placement, since there are 4 students but only 3 teams. " +
            "To address this issue, you will need to duplicate the rows associated with the team taking multiple students, " +
            "and you will need to update the team name to differentiate between the two positions. " +
            "The fixed input for the data above would look like this:"
        ));

        demo_score_table = document.createElement('table');
        instructions_div.appendChild(demo_score_table);

        demo_score_table.innerHTML =
            "<thead>" +
            "   <tr>" +
            "       <th>Student Name</th>" +
            "       <th>Team Name</th>" +
            "       <th>Student Score</th>" +
            "       <th>Team Score</th>" +
            "   </tr>" +
            "</thead>" +
            "<tbody>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Ada Developers Academy, position 1</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Ada Developers Academy, position 2</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>2</td>" +
            "       <td>3</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Emma</td>" +
            "       <td>Ada Developers Academy, position 1</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Emma</td>" +
            "       <td>Ada Developers Academy, position 2</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Emma</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>4</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Ada Developers Academy, position 1</td>" +
            "       <td>5</td>" +
            "       <td>1</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Ada Developers Academy, position 2</td>" +
            "       <td>5</td>" +
            "       <td>1</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Ada Lovelace</td>" +
            "       <td>Ada Developers Academy, position 1</td>" +
            "       <td>2</td>" +
            "       <td>3</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Ada Lovelace</td>" +
            "       <td>Ada Developers Academy, position 2</td>" +
            "       <td>2</td>" +
            "       <td>3</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Ada Lovelace</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "</tbody>";

        let different_num_team_student_h2 = document.createElement('h2');
        different_num_team_student_h2.appendChild(document.createTextNode('Different Numbers of Teams/Students'));
        instructions_div.appendChild(different_num_team_student_h2);

        info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode(
            "Another scenario that may come up is dealing with different numbers of teams and students. " +
            "The example below will assume there are more teams than students, but a similar solution can deal with " +
            "the opposite scenario. " +
            "Suppose there are two students who each interview at three companies, only two of which are shared. " +
            "In this scenario, the raw scores data would look like the following:"
        ));

        demo_score_table = document.createElement('table');
        instructions_div.appendChild(demo_score_table);

        demo_score_table.innerHTML =
            "<thead>" +
            "   <tr>" +
            "       <th>Student Name</th>" +
            "       <th>Team Name</th>" +
            "       <th>Student Score</th>" +
            "       <th>Team Score</th>" +
            "   </tr>" +
            "</thead>" +
            "<tbody>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>2</td>" +
            "       <td>3</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>5</td>" +
            "       <td>1</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Cyberdyne Systems</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "</tbody>";

        info_p = document.createElement('p');
        instructions_div.appendChild(info_p);
        info_p.appendChild(document.createTextNode(
            "As is, the system will not be able to create a placement, since there are 2 students but 4 teams. " +
            "To address this issue, you will need to create placeholder students which represent a team not getting an " +
            "intern assigned to them. " +
            "The number of these placeholders must be enough to make the number of teams and students equal. " +
            "a placeholder student should be given the same score across all teams. " +
            "It shouldn't matter what score is given (as long it's the same across all teams and large enough " +
            "to meet any score thresholding used when creating the placements). " +
            "The fixed input for the data above would look like this:"
        ));

        demo_score_table = document.createElement('table');
        instructions_div.appendChild(demo_score_table);

        demo_score_table.innerHTML =
            "<thead>" +
            "   <tr>" +
            "       <th>Student Name</th>" +
            "       <th>Team Name</th>" +
            "       <th>Student Score</th>" +
            "       <th>Team Score</th>" +
            "   </tr>" +
            "</thead>" +
            "<tbody>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>2</td>" +
            "       <td>3</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Jim</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>5</td>" +
            "       <td>1</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>3</td>" +
            "       <td>4</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>Moby</td>" +
            "       <td>Cyberdyne Systems</td>" +
            "       <td>1</td>" +
            "       <td>2</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 1</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 1</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 1</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 1</td>" +
            "       <td>Cyberdyne Systems</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 2</td>" +
            "       <td>Ada Developers Academy</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 2</td>" +
            "       <td>Lirio, LLC</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 2</td>" +
            "       <td>Acme Corporation</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "   <tr>" +
            "       <td>No Intern 2</td>" +
            "       <td>Cyberdyne Systems</td>" +
            "       <td>5</td>" +
            "       <td>5</td>" +
            "   </tr>" +
            "</tbody>";

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

    const _create_table_entry = function(content) {
        let table_entry = document.createElement('td');
        table_entry.appendChild(content);
        return table_entry;
    };

    const _create_overwrite_select = function(score_obj) {
        let overwrite_select = document.createElement('select');
        $(overwrite_select).change(function() {
            let new_val = JSON.parse($(overwrite_select).find('option:selected').val());
            placement.controller.handle_overwrite_changed(score_obj.id, new_val);
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

        if (score_obj.overwrite == null) {
            blank_option.setAttribute('selected', 'selected');
        } else if (score_obj.overwrite) {
            yes_option.setAttribute('selected', 'selected');
        } else if (!score_obj.overwrite) {
            no_option.setAttribute('selected', 'selected');
        } else {
            throw "Unknown overwrite value: " + score_obj.overwrite;
        }

        return overwrite_select;
    };

    const _create_table_for_scores = function (scores) {
        let scores_table = document.createElement('table');

        let scores_table_head = document.createElement('thead');
        scores_table.append(scores_table_head);

        let header_row = document.createElement('tr');
        scores_table_head.append(header_row);

        let col_names = ['person', 'company', 'student score', 'team score', 'joint score', 'overwrites'];
        for (let i = 0; i < col_names.length; i++) {
            let column_name = col_names[i];
            let header = document.createElement('th');
            header.appendChild(document.createTextNode(column_name));
            header_row.appendChild(header);
        }

        let scores_table_body = document.createElement('tbody');
        scores_table.appendChild(scores_table_body);
        for (let i = 0; i < scores.length; i++) {
            let row = document.createElement('tr');
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].person)));
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].company)));
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].person_score)));
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].company_score)));
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].score)));

            row.appendChild(_create_table_entry(_create_overwrite_select(scores[i])));

            scores_table_body.appendChild(row);
        }

        $(scores_table).tablesorter();

        return scores_table;
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
            placement.controller.handle_setting_change(setting_key, Number(setting_elem.value));
        });

        let setting_label = document.createElement("label");
        setting_label.setAttribute("for", setting_elem.id);
        setting_label.appendChild(document.createTextNode(setting_text));

        setting_container.appendChild(setting_elem);
        setting_container.appendChild(setting_label);

        return setting_container;
    };

    const display_scores_page = function (scores, settings) {
        clear_container();

        let scores_div = document.createElement('div');
        $container.append(scores_div);

        scores_div.appendChild(_create_table_for_scores(scores));

        let settings_div = document.createElement('div');
        $container.append(settings_div);

        let constraints_h1 = document.createElement('h1');
        constraints_h1.appendChild(document.createTextNode('Constraint Settings'));
        settings_div.appendChild(constraints_h1);

        settings_div.appendChild(_create_num_setting(settings, placement.constants.MIN_STUDENT_SCORE,"Min Student Score"));
        settings_div.appendChild(_create_num_setting(settings, placement.constants.MIN_TEAM_SCORE,"Min Team Score"));

        let calculate_div = document.createElement('div');
        $container.append(calculate_div);

        let calculate_button = document.createElement('button');
        calculate_div.appendChild(calculate_button);

        calculate_button.appendChild(document.createTextNode('Calculate Placements!'));
        $(calculate_button).click(function() {
            placement.controller.handle_calculate_button_clicked();
        });
    };

    const display_placements_page = function(solved_model) {
        clear_container();

        let placements_div = document.createElement('div');
        $container.append(placements_div);

        let recompute_div = document.createElement('div');
        $container.append(recompute_div);

        let save_div = document.createElement('div');
        $container.append(save_div);

        // Back
        let back_div = document.createElement('div');
        $container.append(back_div);

        let back_button = document.createElement('button');
        back_div.appendChild(back_button);

        back_button.appendChild(document.createTextNode('Back to Scores'));
        $(back_button).click(function() {
            placement.controller.handle_back_to_scores_button_clicked();
        });

        let h1 = document.createElement('h1');
        placements_div.appendChild(h1);

        if (!solved_model.is_feasible) {
            h1.appendChild(document.createTextNode('No placements possible.'));
            return;
        }

        h1.appendChild(document.createTextNode('Created Placements with Score ' + solved_model.score));

        // Recompute
        let recompute_button = document.createElement('button');
        recompute_div.appendChild(recompute_button);

        recompute_button.appendChild(document.createTextNode('Recompute Placements'));
        $(recompute_button).click(function() {
            placement.controller.handle_calculate_button_clicked();
        });

        // Saving
        let save_sheets_button = document.createElement('button');
        save_div.appendChild(save_sheets_button);

        save_sheets_button.appendChild(document.createTextNode('Save to Google Sheets'));
        $(save_sheets_button).click(function() {
            placement.controller.handle_save_to_sheet();
        });

        let save_csv_button = document.createElement('button');
        save_div.appendChild(save_csv_button);

        save_csv_button.appendChild(document.createTextNode('Save to CSV File'));
        $(save_csv_button).click(function() {
            placement.controller.handle_save_to_csv();
        });

        placements_div.appendChild(_create_table_for_scores(solved_model.placements));
    };

    return {
        init_module: init_module,
        get_landing_generator_fn: get_landing_generator_fn,
        display_scores_page: display_scores_page,
        display_placements_page: display_placements_page,
        display_raw: display_raw
    };
}());