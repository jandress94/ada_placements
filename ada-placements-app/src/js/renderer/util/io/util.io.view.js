util.io.view = (function () {
    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };


    const get_auth_code = function (auth_url) {
        return new Promise((resolve, reject) => {
            clear_container();

            let auth_div = document.createElement('div');
            $container.append(auth_div);

            let title_h1 = document.createElement('h1');
            title_h1.appendChild(document.createTextNode('Google Authorization'));
            auth_div.appendChild(title_h1);

            // auth url
            let auth_url_div = document.createElement('div');
            auth_div.appendChild(auth_url_div);

            let url_p = document.createElement('p');
            auth_url_div.appendChild(url_p);
            url_p.appendChild(document.createTextNode('The Authorization URL is ' + auth_url));

            let click_button_p = document.createElement('p');
            auth_url_div.appendChild(click_button_p);
            click_button_p.appendChild(document.createTextNode('Click button to copy authentication URL: '));

            let copy_url_button = document.createElement('button');
            auth_url_div.appendChild(copy_url_button);
            copy_url_button.appendChild(document.createTextNode('Copy URL'));
            $(copy_url_button).click(function () {
                clipboard.writeText(auth_url);
                alert('URL copied to clipboard!');
            });

            // auth code
            let auth_code_div = document.createElement('div');
            auth_div.appendChild(auth_code_div);

            let input_p = document.createElement('p');
            auth_code_div.appendChild(input_p);
            input_p.appendChild(document.createTextNode('Paste the URL into a web browser, and enter the code from that page here: '));

            let auth_code_input = document.createElement('input');
            auth_code_div.appendChild(auth_code_input);
            auth_code_input.setAttribute('type', 'text');

            let create_token_button = document.createElement('button');
            auth_code_div.appendChild(create_token_button);

            create_token_button.appendChild(document.createTextNode('Authenticate'));
            $(create_token_button).click(function() {
                return resolve(auth_code_input.value);
            });

            // auth code
            let cancel_div = document.createElement('div');
            auth_div.appendChild(cancel_div);

            let cancel_button = document.createElement('button');
            cancel_div.appendChild(cancel_button);

            cancel_button.appendChild(document.createTextNode('Cancel'));
            $(cancel_button).click(function() {
                return reject('Authentication Canceled');
            });
        });
    };

    const get_google_sheet_id = function () {
        return new Promise((resolve, reject) => {
            clear_container();

            let url_div = document.createElement('div');
            $container.append(url_div);

            let url_p = document.createElement('p');
            url_div.appendChild(url_p);
            url_p.appendChild(document.createTextNode('Paste the URL of a Google Sheet: '));

            let url_input = document.createElement('input');
            url_div.appendChild(url_input);
            url_input.setAttribute('type', 'text');

            let enter_button = document.createElement('button');
            url_div.appendChild(enter_button);
            enter_button.appendChild(document.createTextNode('Enter'));
            $(enter_button).click(function () {
                return resolve({canceled: false, sheet_url: url_input.value});
            });

            let cancel_button = document.createElement('button');
            url_div.appendChild(cancel_button);

            cancel_button.appendChild(document.createTextNode('Cancel'));
            $(cancel_button).click(function() {
                return resolve({canceled: true});
            });
        });
    };

    return {
        init_module: init_module,
        get_auth_code: get_auth_code,
        get_google_sheet_id: get_google_sheet_id
    };
}());