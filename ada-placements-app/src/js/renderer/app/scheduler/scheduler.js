const scheduler = (function () {

    const init_module = function ($container, ipcRenderer) {
        scheduler.constants = require('../js/renderer/app/scheduler/constants');
        scheduler.model.init_module();
        scheduler.view.init_module($container);

        ipcRenderer.on('scheduler.loadConfigJSON', function(e) {
            scheduler.controller.handle_load_file();
        });
    };

    const get_landing_generator_fn = function () {
        return scheduler.controller.get_landing_generator_fn();
    };

    return {
        init_module: init_module,
        get_landing_generator_fn: get_landing_generator_fn
    };
}());