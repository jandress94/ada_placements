const placement = (function () {

    const init_module = function ($container) {
        placement.model.init_module();
        placement.view.init_module($container);
    };

    return {
        init_module: init_module
    };
}());