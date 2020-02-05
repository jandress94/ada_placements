spa.controller = (function () {
    const handle_load_scores = function (filepath) {
        spa.model.load_scores_from_file(filepath);
        spa.view.display_scores(spa.model.get_scores());
        spa.view.display_scores(spa.model.get_solved_model());
    };

    return {
        handle_load_scores: handle_load_scores
    };
}());