const electron_view = require('electron');
const {clipboard} = electron_view;


spa.view = (function () {
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

    const _create_table_entry = function(content) {
        let table_entry = document.createElement('td');
        table_entry.appendChild(content);
        return table_entry;
    };

    const _create_overwrite_select = function(score_obj) {
        let overwrite_select = document.createElement('select');
        $(overwrite_select).change(function() {
            let new_val = JSON.parse($(overwrite_select).find('option:selected').val());
            spa.controller.handle_overwrite_changed(score_obj.id, new_val);
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

        let header_row = document.createElement('tr');

        let col_names = ['person', 'company', 'score', 'overwrites'];
        for (let i = 0; i < col_names.length; i++) {
            let column_name = col_names[i];
            let header = document.createElement('th');
            header.appendChild(document.createTextNode(column_name));
            header_row.appendChild(header);
        }
        scores_table.append(header_row);

        for (let i = 0; i < scores.length; i++) {
            let row = document.createElement('tr');
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].person)));
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].company)));
            row.appendChild(_create_table_entry(document.createTextNode(scores[i].score)));

            row.appendChild(_create_table_entry(_create_overwrite_select(scores[i])));

            scores_table.appendChild(row);
        }
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
            spa.controller.handle_calculate_button_clicked();
        });
    };

    const display_placements_page = function(solved_model) {
        clear_container();

        let placements_div = document.createElement('div');
        $container.append(placements_div);

        let recompute_div = document.createElement('div');
        $container.append(recompute_div);

        let recompute_button = document.createElement('button');
        recompute_div.appendChild(recompute_button);

        recompute_button.appendChild(document.createTextNode('Recompute Placements'));
        $(recompute_button).click(function() {
            spa.controller.handle_calculate_button_clicked();
        });

        let back_div = document.createElement('div');
        $container.append(back_div);

        let back_button = document.createElement('button');
        back_div.appendChild(back_button);

        back_button.appendChild(document.createTextNode('Back to Scores'));
        $(back_button).click(function() {
            spa.controller.handle_back_to_scores_button_clicked();
        });

        let h1 = document.createElement('h1');
        placements_div.appendChild(h1);

        if (!solved_model.is_feasible) {
            h1.appendChild(document.createTextNode('No placements possible.'));
            return;
        }

        h1.appendChild(document.createTextNode('Created Placements with Score ' + solved_model.score));

        placements_div.appendChild(_create_table_for_scores(solved_model.placements));
    };

    const display_auth_page = function (auth_url, load_and_display_sheet_fn) {
        clear_container();

        let auth_url_div = document.createElement('div');
        $container.append(auth_url_div);

        auth_url_div.appendChild(document.createTextNode('Click button to copy authentication URL: '));

        let button_copy = document.createElement('button');
        button_copy.appendChild(document.createTextNode('Copy URL'));
        auth_url_div.appendChild((button_copy));
        $(button_copy).click(function () {
            clipboard.writeText(auth_url);
            alert('URL copied to clipboard!');
        });

        let auth_code_div = document.createElement('div');
        $container.append(auth_code_div);

        let form = document.createElement('form');
        auth_code_div.appendChild(form);

        form.appendChild(document.createTextNode('Paste the URL into a web browser, and enter the code from that page here: '));

        let input_code = document.createElement('input');
        $(input_code).attr('type', 'text');
        form.appendChild(input_code);

        form.appendChild(document.createElement('br'))

        let button_submit = document.createElement('button');
        button_submit.appendChild(document.createTextNode('Authenticate'));
        form.appendChild(button_submit);

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            load_and_display_sheet_fn(false, input_code.value);
        });
    };

    return {
        init_module: init_module,
        display_scores_page: display_scores_page,
        display_placements_page: display_placements_page,
        display_raw: display_raw,
        display_auth_page: display_auth_page
    };
}());