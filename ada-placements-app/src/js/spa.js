/*global $, spa */

const spa = (function () {
    var initModule = function ($container) {
        let text = document.createTextNode("Hello World");
        $container.append(text);
    };

    return {initModule: initModule};
}());