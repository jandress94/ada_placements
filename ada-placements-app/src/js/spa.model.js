spa.model = (function () {
    let scores;

    const init_module = function () {
        scores = null;
    };

    const get_scores = function () {
        return scores;
    };
    
    const load_scores_from_file = function (filename) {
        scores = filename;
    };

    return {
        init_module: init_module,
        get_scores: get_scores,
        load_scores_from_file: load_scores_from_file
    };
}());