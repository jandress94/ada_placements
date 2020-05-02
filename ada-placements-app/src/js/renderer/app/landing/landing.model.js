landing.model = (function () {
    let subapp_generator_fns;

    const init_module = function () {
        subapp_generator_fns = [];
    };

    const register_subapp = function (subapp) {
        subapp_generator_fns.push(subapp.get_landing_generator_fn());
    };

    const get_subapp_generator_fns = function () {
        return subapp_generator_fns;
    };

    return {
        init_module: init_module,
        register_subapp: register_subapp,
        get_subapp_generator_fns: get_subapp_generator_fns
    };
}());