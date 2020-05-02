landing.view = (function () {
    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };

    const display_landing = function (subapp_generator_fns) {
        clear_container();

        let subapps_div = document.createElement('div');
        $container.append(subapps_div);

        for (let i = 0; i < subapp_generator_fns.length; i++) {
            subapps_div.appendChild(subapp_generator_fns[i]());
        }
    };

    return {
        init_module: init_module,
        display_landing: display_landing
    };
}());