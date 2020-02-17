spa.controller = (function () {
    const handle_load_scores_from_file = function (filepath) {
        spa.model.load_scores_from_file(filepath);
        spa.view.display_scores_page(spa.model.get_scores());
    };

    const handle_load_scores_from_sheets = function (sheetUrl) {
        spa.model.load_scores_from_sheets(sheetUrl).then(function(){
            spa.view.display_scores_page(spa.model.get_scores());
        });
    };

    const handle_overwrite_changed = function (score_id, new_val) {
        spa.model.update_overwrite(score_id, new_val);
    };

    const handle_calculate_button_clicked = function () {
        let solved_model = spa.model.get_solved_model();
        spa.view.display_placements_page(solved_model);
    };

    const handle_back_to_scores_button_clicked = function () {
        spa.view.display_scores_page(spa.model.get_scores());
    };

    const handle_save_placements_button_clicked = function () {
        spa.model.save_placements_to_sheets().then(function(successMsg) {
            alert(successMsg);
        }).catch(function(err) {
            alert(err);
        });
    };

    const handle_save_csv_button_clicked = function () {
        spa.model.save_placements_to_csv().then(function(successMsg) {
            alert(successMsg);
        }).catch(function(err) {
            alert(err);
        });
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