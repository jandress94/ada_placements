spa.controller = (function () {
    const handle_load_scores = function (filepath) {
        spa.model.load_scores_from_file(filepath);
        spa.view.display_scores_page(spa.model.get_scores());
    };

    const handle_overwrite_changed = function (score_id, new_val) {
        spa.model.update_overwrite(score_id, new_val);
        spa.view.display_scores_page(spa.model.get_scores());
    };

    const handle_calculate_button_clicked = function () {
        let solved_model = spa.model.get_solved_model();
        spa.view.display_placements_page(solved_model);
    };

    return {
        handle_load_scores: handle_load_scores,
        handle_overwrite_changed: handle_overwrite_changed,
        handle_calculate_button_clicked: handle_calculate_button_clicked
    };
}());