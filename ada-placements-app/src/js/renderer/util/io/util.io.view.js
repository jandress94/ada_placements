util.io.view = (function () {
    let $container;

    const init_module = function ($c) {
        $container = $c;
    };

    const clear_container = function() {
        $container.empty();
    };

    const get_google_creds = function () {
        const _create_instructions_section = function (title, steps) {
            let section_div = document.createElement('div');
            $container.append(section_div);

            let section_h1 = document.createElement('h1');
            section_h1.appendChild(document.createTextNode(title));
            section_div.appendChild(section_h1);

            let section_ol = document.createElement('ol');
            section_div.appendChild(section_ol);

            for (let i = 0; i < steps.length; i++) {
                let step_li = document.createElement('li');
                step_li.appendChild(document.createTextNode(steps[i]));
                section_ol.appendChild(step_li);
            }
        };

        return new Promise((resolve, reject) => {
            clear_container();

            _create_instructions_section("Create New Google Cloud Project", [
                'Go to https://console.developers.google.com/apis/library',
                'At the top of the page choose "Select a Project", or the drop-down arrow if a project is already selected.',
                'Click "New Project".',
                'Give the project a name (e.g. "ada-placement-apps")',
                'Choose a Location (in your GSuite)',
                'Click "Create"'
            ]);

            _create_instructions_section("Enable the Google Sheets API", [
                'Go to https://console.developers.google.com/apis/dashboard',
                'Click "Enable APIs and Services"',
                'Search for "Google Sheets" and select the Google Sheets API',
                'Click "Enable"'
            ]);

            _create_instructions_section("Set up the Consent Page", [
                'Go to https://console.developers.google.com/apis/credentials/consent',
                'Select "Internal" if possible, otherwise "External"',
                'Click "Create"',
                'Set the Application Name (e.g. "Ada Placement App")',
                'Verify the Support Email',
                'Click "Save"'
            ]);

            _create_instructions_section("Create a OAuth Client", [
                'Go to https://console.developers.google.com/apis/credentials',
                'Click "Create Credentials" then "OAuth Client ID"',
                'Set the Application Type to "Desktop app"',
                'Set the Client Name (e.g. "Ada Placement App Client 1")',
                'Click "Create"'
            ]);

            _create_instructions_section('Download and Link the Credentials File', [
                'Go to https://console.developers.google.com/apis/credentials',
                'Under the "OAuth 2.0 Client IDs" section, click the download arrow on the far right for the client you just created.',
                'Click the button below, navigate to and open the credentials file that was just downloaded using the dialog box.'
            ]);

            // link file
            let open_file_div = document.createElement('div');
            $container.append(open_file_div);

            let open_file_button = document.createElement('button');
            open_file_div.appendChild(open_file_button);

            open_file_button.appendChild(document.createTextNode('Click here to link the Credentials File'));
            $(open_file_button).click(function () {
                dialog.showOpenDialog({
                    properties: ['openFile'],
                    filters: [{ name: 'JSON', extensions: ['json'] }]
                })
                    .then(result => {
                        if (!result.canceled) {
                            return resolve(result.filePaths[0]);
                        }
                    });
            });

            // cancel
            let cancel_div = document.createElement('div');
            $container.append(cancel_div);

            let cancel_button = document.createElement('button');
            cancel_div.appendChild(cancel_button);

            cancel_button.appendChild(document.createTextNode('Cancel'));
            $(cancel_button).click(function() {
                return reject('Google Credential Creation Canceled');
            });
        });
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
            input_p.appendChild(document.createTextNode('Paste the URL into a web browser, follow the prompts, and enter the code from that page here: '));

            let auth_code_input = document.createElement('input');
            auth_code_div.appendChild(auth_code_input);
            auth_code_input.setAttribute('type', 'text');

            let create_token_button = document.createElement('button');
            auth_code_div.appendChild(create_token_button);

            create_token_button.appendChild(document.createTextNode('Authenticate'));
            $(create_token_button).click(function() {
                return resolve(auth_code_input.value);
            });

            // cancel
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
        get_google_creds: get_google_creds,
        get_auth_code: get_auth_code,
        get_google_sheet_id: get_google_sheet_id
    };
}());