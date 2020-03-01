scheduler.view = (function () {
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

    return {
        init_module: init_module,
        display_raw: display_raw
    };
}());