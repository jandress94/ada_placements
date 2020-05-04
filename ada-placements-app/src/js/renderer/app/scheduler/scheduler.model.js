scheduler.model = (function () {
    let config;
    let solved_model;
    let _var_name_to_data_map;

    const init_module = function () {
        config = null;
        solved_model = null;
        _var_name_to_data_map = null;
    };

    const set_config = function (c) {
        return new Promise((resolve, reject) => {
            config = c;
            _add_default_settings();
            return resolve();
        })
    };

    const get_solved_model = function () {
        return new Promise((resolve, reject) => {
            if (solved_model == null) {
                return _solve_model()
                    .then(function() {
                        return resolve(solved_model);
                    })
                    .catch(function(err) {
                        return reject(err);
                    })
            }
            return resolve(solved_model);
        });
    };

    const _get_override_val = function(overrides, person_name, team_name) {
        for (let i = 0; i < overrides.length; i++) {
            const over = overrides[i];
            if (person_name === over.person.replace(/ /g, "") && team_name === over.team.replace(/ /g, "")) {
                return over.value;
            }
        }

        return null;
    };

    const update_overwrite = function(student_name, team_name, new_val) {
        solved_model = null;
        _var_name_to_data_map = null;

        let overrides = config[scheduler.constants.OVERRIDES];

        for (let i = 0; i < overrides.length; i++) {
            const over = overrides[i];
            if (student_name === over.person && team_name === over.team) {
                overrides.splice(i, 1);
                break;
            }
        }

        if (new_val !== null) {
            config[scheduler.constants.OVERRIDES].push({
                person: student_name,
                team: team_name,
                value: new_val
            });
        }
    };

    const _create_window_mappings = function (timeslots) {
        // windows are denoted by their starting timeslot
        let timeslot_to_window_map = {};
        for (let idx_day = 0; idx_day < timeslots.length; idx_day++) {
            let day = timeslots[idx_day].day;
            let day_timeslots = timeslots[idx_day].times;

            for (let idx_time = 0; idx_time < day_timeslots.length; idx_time++) {
                let window_base_time = day_timeslots[idx_time];

                for (let idx_window = idx_time; (idx_window < idx_time + config[scheduler.constants.SETTINGS][scheduler.constants.TIME_WINDOW_SIZE]) && (idx_window < day_timeslots.length); idx_window++) {
                    let time = day_timeslots[idx_window];
                    let timeslot = day + "_" + time;
                    if (!timeslot_to_window_map.hasOwnProperty(timeslot)) {
                        timeslot_to_window_map[timeslot] = [];
                    }
                    timeslot_to_window_map[timeslot].push('window_' + day + window_base_time);
                }
            }
        }

        return timeslot_to_window_map;
    };

    const _create_cnstrt_and_push = function(c_map, c, c_key, v, limits) {
        if (!c_map[c].hasOwnProperty(c_key)) {
            c_map[c][c_key] = {
                limits: limits,
                vars: []
            };
        }
        c_map[c][c_key].vars.push(v);
    };

    const _create_ampl_model = function () {
        _var_name_to_data_map = {};

        let company_configs = config[scheduler.constants.COMPANIES];
        let student_configs = config[scheduler.constants.STUDENTS];
        let timeslot_to_window_map = _create_window_mappings(config[scheduler.constants.TIMESLOTS]);

        let var_names = [];
        let score_terms = [];
        let constraints_map = {};
        for (let i = 1; i <= 11; i++) {
            constraints_map['c' + i] = {};
        }

        for (let idx_student = 0; idx_student < student_configs.length; idx_student++) {
            let student = student_configs[idx_student];

            for (let idx_company = 0; idx_company < company_configs.length; idx_company++) {
                let company = company_configs[idx_company];

                for (let idx_team = 0; idx_team < company.teams.length; idx_team++) {
                    let team = company.teams[idx_team];

                    for (let idx_int = 0; idx_int < team.interviewers.length; idx_int++) {
                        let interviewer = team.interviewers[idx_int];

                        for (let idx_slot = 0; idx_slot < interviewer.timeslots.length; idx_slot++) {
                            let timeslot = interviewer.timeslots[idx_slot];

                            let s_name = student.name.replace(/ /g, "");
                            let c_name = company.name.replace(/ /g, "");
                            let t_name = team.name.replace(/ /g, "");
                            let i_name = interviewer.name.replace(/ /g, "");

                            let var_name = "var_" + s_name + "_" + i_name + "_" + timeslot;
                            var_names.push(var_name);

                            let is_student_pref = student.preferences.indexOf(team.name) > -1;
                            let is_team_pref = team.preferences.indexOf(student.name) > -1;

                            let over_val = _get_override_val(config[scheduler.constants.OVERRIDES], s_name, t_name);

                            let score = 0;
                            if (is_student_pref && is_team_pref) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.IS_MUTUAL_PREF_SCORE];
                            } else if (is_student_pref) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.IS_STUDENT_PREF_SCORE];
                            } else if (is_team_pref) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.IS_TEAM_PREF_SCORE];
                            }

                            let difficulty_diff = student.difficulty - team.difficulty;
                            if (difficulty_diff === 2) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.DIFFICULTY_DIFF_2_SCORE];
                            } else if (difficulty_diff === 1) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.DIFFICULTY_DIFF_1_SCORE];
                            } else if (difficulty_diff === 0) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.DIFFICULTY_DIFF_0_SCORE];
                            } else if (difficulty_diff === -1) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.DIFFICULTY_DIFF_MINUS1_SCORE];
                            } else if (difficulty_diff === -2) {
                                score += config[scheduler.constants.SETTINGS][scheduler.constants.DIFFICULTY_DIFF_MINUS2_SCORE];
                            }

                            _var_name_to_data_map[var_name] = {
                                student_name: student.name,
                                company_name: company.name,
                                team_name: team.name,
                                interviewer_name: interviewer.name,
                                timeslot: timeslot,
                                is_student_pref: is_student_pref,
                                is_team_pref: is_team_pref,
                                difficulty_diff: difficulty_diff,
                                is_override: over_val,
                                score: score
                            };

                            score_terms.push(score + " * " + var_name);

                            // make sure each student interviews with at least n teams and at most m teams
                            _create_cnstrt_and_push(constraints_map, 'c1', s_name, var_name,
                                {
                                    min: config[scheduler.constants.SETTINGS][scheduler.constants.MIN_INTERVIEW_PER_STUDENT],
                                    max: config[scheduler.constants.SETTINGS][scheduler.constants.MAX_INTERVIEW_PER_STUDENT]
                                }
                            );

                            // make sure each interviewer has each slot filled at most once
                            _create_cnstrt_and_push(constraints_map, 'c2', i_name + "_" + timeslot, var_name, { max: 1 });

                            // make sure each interviewer has at least n interviews
                            _create_cnstrt_and_push(constraints_map, 'c3', i_name, var_name,
                                {
                                    min: config[scheduler.constants.SETTINGS][scheduler.constants.MIN_INTERVIEW_PER_INTERVIEWER]
                                }
                            );

                            // make sure each student is in each timestot at most once
                            _create_cnstrt_and_push(constraints_map, 'c4', s_name + "_" + timeslot, var_name, { max: 1 });

                            // make sure each student interviews with each company at most n times
                            _create_cnstrt_and_push(constraints_map, 'c5', s_name + "_" + c_name, var_name,
                                {
                                        max: config[scheduler.constants.SETTINGS][scheduler.constants.MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT]
                                }
                            );

                            // make sure each student interviews with each team at most once
                            _create_cnstrt_and_push(constraints_map, 'c6', s_name + "_" + t_name, var_name, { max: 1 });

                            // make sure each student interviews with at least n of their preferences
                            if (is_student_pref) {
                                _create_cnstrt_and_push(constraints_map, 'c7', s_name, var_name,
                                    {
                                        min: Math.min(
                                            config[scheduler.constants.SETTINGS][scheduler.constants.MIN_STUDENT_PREFS_GUARANTEED],
                                            student.preferences.length
                                        )
                                    }
                                );
                            }

                            // make sure each team interviews with at least n of their preferences
                            if (is_team_pref) {
                                _create_cnstrt_and_push(constraints_map, 'c8', t_name, var_name,
                                    {
                                        min: Math.min(
                                            config[scheduler.constants.SETTINGS][scheduler.constants.MIN_TEAM_PREFS_GUARANTEED_PER_POSITION] * team.positions,
                                            team.preferences.length
                                        )
                                    }
                                );
                            }

                            // if preferences align, make sure interview occurs
                            if (config[scheduler.constants.SETTINGS][scheduler.constants.REQUIRE_MUTUAL_PREFS_TO_INTERVIEW] && is_student_pref && is_team_pref) {
                                _create_cnstrt_and_push(constraints_map, 'c9', s_name + "_" + t_name, var_name, { min: 1 });
                            }

                            // add in overwrites
                            if (over_val !== null){
                                _create_cnstrt_and_push(constraints_map, 'c10', s_name + "_" + t_name, var_name, { equal: over_val ? 1 : 0 });
                            }

                            // time windows
                            for (let idx_window = 0; idx_window < timeslot_to_window_map[timeslot].length; idx_window++) {
                                let window = timeslot_to_window_map[timeslot][idx_window];
                                _create_cnstrt_and_push(constraints_map, 'c11', s_name + "_" + window, var_name,
                                    {
                                        max: config[scheduler.constants.SETTINGS][scheduler.constants.MAX_INTERVIEW_PER_TIME_WINDOW]
                                    }
                                );
                            }
                        }
                    }
                }
            }
        }

        let model_data = '';

        for (let i = 0; i < var_names.length; i++) {
            model_data += '\nvar ' + var_names[i] + ' binary;';
        }

        model_data += '\nmaximize Score: ' + score_terms.join(' + ') + ";";

        for (const c in constraints_map) {
            if (!constraints_map.hasOwnProperty(c)) {
                continue;
            }

            for (const c_key in constraints_map[c]) {
                if (!constraints_map[c].hasOwnProperty(c_key)) {
                    continue;
                }

                let c_entry = constraints_map[c][c_key];

                let c_str = '';
                if (c_entry.limits.hasOwnProperty('min')) {
                    c_str += c_entry.limits.min + " <= "
                }
                c_str += c_entry.vars.join(' + ');
                if (c_entry.limits.hasOwnProperty('max')) {
                    c_str += " <= " + c_entry.limits.max;
                } else if (c_entry.limits.hasOwnProperty('equal')) {
                    c_str += " = " + c_entry.limits['equal'];
                }

                model_data += '\nsubject to ' + c + "_" + c_key + ": " + c_str + ";";
            }
        }

        return model_data;
    };

    const _parse_solved_model = function(data) {
        let results = atob($(data.documentElement).find('base64').first().text());

        let status_idx = results.indexOf('PRIMAL_FEASIBLE');

        if (status_idx < 0) {
            solved_model = {
                is_feasible: false
            };
            return;
        }

        solved_model = {
            is_feasible: true
        };

        // get the optimal score
        let score_idx = results.indexOf('Primal objective');
        let colon_idx = results.indexOf(':', score_idx);
        let end_line_idx = results.indexOf('\n', colon_idx);
        solved_model['score'] = Number(results.substring(colon_idx + 1, end_line_idx).trim());

        // parse result lines
        let lines = results.substr(results.indexOf('_varname', colon_idx)).split('\n');
        let assigned_vars = [];
        for (let i = 1; i < lines.length; i++) {
            let l = lines[i].trim();
            if (l.match(/^\d+\s+/) === null) {
                break;
            }

            let l_split = l.split(/\s+/g);

            if (l_split.length !== 2) {
                alert(l_split);
                break;
            }

            assigned_vars.push(l_split[1]);
        }

        solved_model.schedule = [];
        for (let i = 0; i < assigned_vars.length; i++) {
            solved_model.schedule.push(_var_name_to_data_map[assigned_vars[i]]);
        }
    };

    const _get_solved_model = function(data) {
        return new Promise((resolve, reject) => {
            let $d = $(data.documentElement).find("data");

            let job_num = $d.find('int').first().text();
            let job_pwd = $d.find('string').first().text();

            let xml_rpc_results_request = '<methodCall><methodName>getFinalResults</methodName><params><param><value><int>' +
                job_num +
                '</int></value></param><param><value><string>' +
                job_pwd +
                '</string></value></param></params></methodCall>';

            $.post('https://neos-server.org:3333', xml_rpc_results_request)
                .done(function(data) {
                    _parse_solved_model(data);
                    return resolve();
                })
                .fail(function(err) {
                    return reject('Error getting job results: ' + JSON.stringify(err));
                });
        });
    };

    const _solve_model = function () {
        return new Promise((resolve, reject) => {
            let ampl_model = _create_ampl_model();

            let job_xml = "<document>" +
                "<category>milp</category>" +
                "<solver>MOSEK</solver>" +
                "<inputType>AMPL</inputType>" +
                "<priority>long</priority>" +
                "<email></email>" +
                "<model><![CDATA[" +
                ampl_model +
                "]]></model>" +
                "<data><![CDATA[]]></data>" +
                "<commands><![CDATA[solve;\n" +
                "option display_width 500, display_1col 500;" +
                "display {j in 1.._nvars: _var[j] > 0.5} _varname[j];]]></commands>" +
                "<comments><![CDATA[]]></comments>" +
                "</document>"

            job_xml = job_xml.replace(/</g, '&lt;').replace(/>/g, '&gt;');

            let xml_rpc_submit_request = '<methodCall><methodName>submitJob</methodName><params><param><value><string>' +
                job_xml +
                '</string></value></param></params></methodCall>';

            $.post('https://neos-server.org:3333', xml_rpc_submit_request)
                .done(function(data) {
                    _get_solved_model(data)
                        .then(function() {
                            return resolve();
                        })
                        .catch(function (err) {
                            return reject(err);
                        });
                })
                .fail(function(err) {
                    return reject('Error submitting job: ' + JSON.stringify(err));
                });
        });
    };
    
    const _add_default_settings = function () {
        const _add_val_if_not_exists = function (d, k, v) {
            if (!d.hasOwnProperty(k)) {
                d[k] = v;
            }
        };

        _add_val_if_not_exists(config, scheduler.constants.SETTINGS, {});
        const settings = config[scheduler.constants.SETTINGS];

        // constraints

        _add_val_if_not_exists(settings, scheduler.constants.MAX_INTERVIEW_PER_STUDENT,
            scheduler.constants.DEFAULT_MAX_INTERVIEW_PER_STUDENT);

        _add_val_if_not_exists(settings, scheduler.constants.MIN_INTERVIEW_PER_STUDENT,
            scheduler.constants.DEFAULT_MIN_INTERVIEW_PER_STUDENT);

        _add_val_if_not_exists(settings, scheduler.constants.MIN_INTERVIEW_PER_INTERVIEWER,
            scheduler.constants.DEFAULT_MIN_INTERVIEW_PER_INTERVIEWER);

        _add_val_if_not_exists(settings, scheduler.constants.MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT,
            scheduler.constants.DEFAULT_MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT);

        _add_val_if_not_exists(settings, scheduler.constants.MIN_STUDENT_PREFS_GUARANTEED,
            scheduler.constants.DEFAULT_MIN_STUDENT_PREFS_GUARANTEED);

        _add_val_if_not_exists(settings, scheduler.constants.MIN_TEAM_PREFS_GUARANTEED_PER_POSITION,
            scheduler.constants.DEFAULT_MIN_TEAM_PREFS_GUARANTEED_PER_POSITION);

        _add_val_if_not_exists(settings, scheduler.constants.REQUIRE_MUTUAL_PREFS_TO_INTERVIEW,
            scheduler.constants.DEFAULT_REQUIRE_MUTUAL_PREFS_TO_INTERVIEW);

        _add_val_if_not_exists(settings, scheduler.constants.TIME_WINDOW_SIZE,
            scheduler.constants.DEFAULT_TIME_WINDOW_SIZE);

        _add_val_if_not_exists(settings, scheduler.constants.MAX_INTERVIEW_PER_TIME_WINDOW,
            scheduler.constants.DEFAULT_MAX_INTERVIEW_PER_TIME_WINDOW);

        // scoring

        _add_val_if_not_exists(settings, scheduler.constants.DIFFICULTY_DIFF_2_SCORE,
            scheduler.constants.DEFAULT_DIFFICULTY_DIFF_2_SCORE);

        _add_val_if_not_exists(settings, scheduler.constants.DIFFICULTY_DIFF_1_SCORE,
            scheduler.constants.DEFAULT_DIFFICULTY_DIFF_1_SCORE);

        _add_val_if_not_exists(settings, scheduler.constants.DIFFICULTY_DIFF_0_SCORE,
            scheduler.constants.DEFAULT_DIFFICULTY_DIFF_0_SCORE);

        _add_val_if_not_exists(settings, scheduler.constants.DIFFICULTY_DIFF_MINUS1_SCORE,
            scheduler.constants.DEFAULT_DIFFICULTY_DIFF_MINUS1_SCORE);

        _add_val_if_not_exists(settings, scheduler.constants.DIFFICULTY_DIFF_MINUS2_SCORE,
            scheduler.constants.DEFAULT_DIFFICULTY_DIFF_MINUS2_SCORE);

        _add_val_if_not_exists(settings, scheduler.constants.IS_STUDENT_PREF_SCORE,
            scheduler.constants.DEFAULT_IS_STUDENT_PREF_SCORE);

        _add_val_if_not_exists(settings, scheduler.constants.IS_TEAM_PREF_SCORE,
            scheduler.constants.DEFAULT_IS_TEAM_PREF_SCORE);

        _add_val_if_not_exists(settings, scheduler.constants.IS_MUTUAL_PREF_SCORE,
            scheduler.constants.DEFAULT_IS_MUTUAL_PREF_SCORE);
    };

    const load_config_json = function (configUrl) {
        return fs.readFile(configUrl, 'utf8')
            .then(configStr => {
                config = JSON.parse(configStr);
                _add_default_settings();
            });
    };

    const update_setting = function (setting_key, new_val) {
        solved_model = null;
        _var_name_to_data_map = null;
        config[scheduler.constants.SETTINGS][setting_key] = new_val;
    };

    const get_config = function () {
        return config;
    };

    const _save_schedule_to_array = function(schedule) {
        let values = [['Student', 'Company', 'Team', 'Interviewer', 'Timeslot', 'Student Preference?', 'Team Preference?', 'Student - Team Difficulty', 'Score', 'Override']];
        for (let i = 0; i < schedule.length; i++) {
            let s = schedule[i];

            values.push([
                s.student_name,
                s.company_name,
                s.team_name,
                s.interviewer_name,
                s.timeslot,
                s.is_student_pref.toString(),
                s.is_team_pref.toString(),
                s.difficulty_diff,
                s.score,
                s.is_override === null ? s.is_override : s.is_override.toString()
            ]);
        }
        return values;
    };

    const save_schedule_to_sheets = function () {
        return new Promise((resolve, reject) => {
            return reject("Not Implemented");
        });
    };

    const save_schedule_to_csv = function () {
        return new Promise((resolve, reject) => {
            if (solved_model === null) {
                reject("Cannot save because the schedule has not been recomputed.");
            }
            resolve(solved_model.schedule);
        }).then(
            schedule_data => util.io.save_to_csv(() => _save_schedule_to_array(schedule_data))
        );
    };

    return {
        init_module: init_module,
        set_config: set_config,
        load_config_json: load_config_json,
        get_config: get_config,
        update_setting: update_setting,
        get_solved_model: get_solved_model,
        update_overwrite: update_overwrite,
        save_schedule_to_sheets: save_schedule_to_sheets,
        save_schedule_to_csv: save_schedule_to_csv
    };
}());