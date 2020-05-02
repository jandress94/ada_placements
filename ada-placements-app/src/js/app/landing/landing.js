const landing = (function () {

    const init_module = function ($container) {
        landing.model.init_module();
        landing.view.init_module($container);
    };

    const register_subapp = function (subapp) {
        landing.controller.register_subapp(subapp);
    };

    const start = function () {
        landing.controller.display_landing();
    };

    return {
        init_module: init_module,
        register_subapp: register_subapp,
        start: start
    };
}());