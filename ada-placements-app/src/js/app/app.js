const app = (function () {

    const init_module = function ($container) {
        landing.init_module($container);

        scheduler.init_module($container);
        landing.register_subapp(scheduler);

        placement.init_module($container);
        landing.register_subapp(placement);

        landing.start();
    };

    return {
        init_module: init_module
    };
}());