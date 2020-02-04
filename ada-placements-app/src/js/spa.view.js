spa.view = (function () {
    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const display_scores = function (scores) {
        let text_node = document.createTextNode(JSON.stringify(scores));
        $container.append(text_node);
    };

    return {
        init_module: init_module,
        display_scores: display_scores
    };
}());