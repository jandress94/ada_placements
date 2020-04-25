placement.controller = (function () {
    const handle_load_scores_from_file = function (filepath) {
        console.log('before');
        placement.model.load_scores_from_file(filepath)
            .then(() => placement.view.display_scores_page(placement.model.get_scores()))
            .catch(alert);
        console.log('after');
    };

    const handle_load_scores_from_sheets = function (sheetUrl) {
        placement.model.load_scores_from_sheets(sheetUrl).then(function(){
            placement.view.display_scores_page(placement.model.get_scores());
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
        placement.view.display_scores_page(placement.model.get_scores());
    };

    const handle_save_placements_button_clicked = function () {
        placement.model.save_placements_to_sheets().then(function(successMsg) {
            alert(successMsg);
        }).catch(function(err) {
            alert(err);
        });
    };

    const handle_save_csv_button_clicked = function () {
        placement.model.save_placements_to_csv()
            .then(save_state => {
                if (save_state.state === 'success') {
                    alert("Save successful");
                }
            })
            .catch(err => alert(err));
    };

    return {
        handle_load_scores_from_file: handle_load_scores_from_file,
        handle_load_scores_from_sheets: handle_load_scores_from_sheets,
        handle_overwrite_changed: handle_overwrite_changed,
        handle_calculate_button_clicked: handle_calculate_button_clicked,
        handle_back_to_scores_button_clicked: handle_back_to_scores_button_clicked,
        handle_save_sheets_button_clicked: handle_save_placements_button_clicked,
        handle_save_csv_button_clicked: handle_save_csv_button_clicked
    };
}());