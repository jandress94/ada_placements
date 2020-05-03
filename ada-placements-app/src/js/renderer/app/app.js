const app = (function () {

    const init_module = function ($container, ipcRenderer) {
        util.init_module($container);

        landing.init_module($container, ipcRenderer);

        scheduler.init_module($container, ipcRenderer);
        landing.register_subapp(scheduler);

        placement.init_module($container, ipcRenderer);
        landing.register_subapp(placement);

        landing.start();
    };

    return {
        init_module: init_module
    };
}());