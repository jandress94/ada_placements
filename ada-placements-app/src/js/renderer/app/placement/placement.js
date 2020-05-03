const placement = (function () {

    const init_module = function ($container, ipcRenderer) {
        placement.constants = require('../js/renderer/app/placement/constants');
        placement.model.init_module();
        placement.view.init_module($container);

        ipcRenderer.on('placement.loadScoresFile', function(e) {
            placement.controller.handle_load_file();
        });

        ipcRenderer.on('placement.loadScoresSheet', function (e) {
            placement.controller.handle_load_sheet();
        })
    };

    const get_landing_generator_fn = function () {
        return placement.controller.get_landing_generator_fn();
    };

    return {
        init_module: init_module,
        get_landing_generator_fn: get_landing_generator_fn
    };
}());