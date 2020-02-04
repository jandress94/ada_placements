const spa = (function () {

    const init_module = function ($container) {
        spa.model.init_module();
        spa.view.init_module($container);
    };

    return {
        init_module: init_module
    };
}());