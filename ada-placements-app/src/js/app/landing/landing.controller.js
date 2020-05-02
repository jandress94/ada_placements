landing.controller = (function () {
    const display_landing = function () {
        landing.view.display_landing(landing.model.get_subapp_generator_fns());
    };

    const register_subapp = function (subapp) {
        landing.model.register_subapp(subapp);
    };

    return {
        display_landing: display_landing,
        register_subapp: register_subapp
    };
}());