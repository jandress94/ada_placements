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

    const display_scores_page = function (scores) {
        const _create_table_entry = function(content) {
            let table_entry = document.createElement('td');
            table_entry.appendChild(content);
            return table_entry;
        };
        const _create_overwrite = function(score_obj) {
            let overwrite_select = document.createElement('select');
            $(overwrite_select).change(function() {
                let new_val = JSON.parse($(overwrite_select).find('option:selected').val());
                spa.controller.handle_overwrite_changed(score_obj, new_val);
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

        clear_container();

        let scores_div = document.createElement('div');
        $container.append(scores_div);

        let scores_table = document.createElement('table');
        scores_div.appendChild(scores_table);

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

            row.appendChild(_create_table_entry(_create_overwrite(scores[i])));

            scores_table.appendChild(row);
        }

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

        let ul = document.createElement('ul');
        placements_div.appendChild(ul);

        for (const key in solved_model) {
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(key + ": " + solved_model[key]));
            ul.appendChild(li);
        }
    };

    return {
        init_module: init_module,
        display_scores_page: display_scores_page,
        display_placements_page: display_placements_page,
        display_raw: display_raw
    };
}());