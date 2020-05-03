const util = (function() {
    const init_module = function ($container) {
        util.io.init_module($container);
    };

    return {
        init_module: init_module
    };
}());