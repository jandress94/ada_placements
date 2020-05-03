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

        let col_names = ['person', 'company', 'score', 'overwrites'];
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
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].score)));

            row.appendChild(_create_table_entry(_create_overwrite_select(scores[i])));

            scores_table_body.appendChild(row);
        }

        $(scores_table).tablesorter();

        return scores_table;
    };

    const display_scores_page = function (scores) {
        clear_container();

        let scores_div = document.createElement('div');
        $container.append(scores_div);

        scores_div.appendChild(_create_table_for_scores(scores));

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
            placement.controller.handle_save_sheets_button_clicked();
        });

        let save_csv_button = document.createElement('button');
        save_div.appendChild(save_csv_button);

        save_csv_button.appendChild(document.createTextNode('Save to CSV File'));
        $(save_csv_button).click(function() {
            placement.controller.handle_save_csv_button_clicked();
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