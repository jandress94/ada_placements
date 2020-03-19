const scheduler = (function () {

    const init_module = function ($container) {
        scheduler.constants = require('../js/scheduler/constants');
        scheduler.model.init_module();
        scheduler.view.init_module($container);
    };

    return {
        init_module: init_module
    };
}());