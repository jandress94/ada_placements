scheduler.model = (function () {
    let config;
    let solved_model;
    let _var_name_to_data_map;

    const init_module = function () {
        config = null;
        solved_model = null;
        _var_name_to_data_map = null;
        scheduler.model.id_lookup.init_module();
    };

    const set_config = function (c) {
        return new Promise((resolve, reject) => {
            solved_model = null;
            config = c;
            _add_default_settings();
            return resolve();
        })
            .then(scheduler.model.validation.validate_config)
            .then(scheduler.model.id_lookup.create_id_lookup);
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
            if (person_name === over.person && team_name === over.team) {
                return over.value;
            }
        }

        return null;
    };

    const update_overwrite = function(student_name, team_name, new_val) {
        solved_model = null;
        _var_name_to_data_map = null;

        let overrides = config.overrides;

        for (let i = 0; i < overrides.length; i++) {
            const over = overrides[i];
            if (student_name === over.person && team_name === over.team) {
                overrides.splice(i, 1);
                break;
            }
        }

        if (new_val !== null) {
            config.overrides.push({
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

                for (let idx_window = idx_time; (idx_window < idx_time + config.settings[scheduler.constants.TIME_WINDOW_SIZE]) && (idx_window < day_timeslots.length); idx_window++) {
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
        if (!c_map.hasOwnProperty(c)) {
            c_map[c] = {};
        }
        if (!c_map[c].hasOwnProperty(c_key)) {
            c_map[c][c_key] = {
                limits: limits,
                vars: []
            };
        }
        c_map[c][c_key].vars.push(v);
    };

    const _get_num_allowed_prefs = function (student_names, team_names) {
        let count = 0;
        for (let i = 0; i < student_names.length; i++) {
            for (let j = 0; j < team_names.length; j++) {
                let over_val = _get_override_val(config.overrides, student_names[i], team_names[j]);
                if (over_val === null || over_val){
                    count++;
                }
            }
        }
        return count;
    };

    const _create_ampl_model = function () {
        _var_name_to_data_map = {};

        let company_configs = config.companies;
        let student_configs = config.students;
        let timeslot_to_window_map = _create_window_mappings(config.timeslots);

        let var_names = [];
        let score_terms = [];
        let constraints_map = {};

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
                            let day = timeslot.substr(0, timeslot.indexOf('_'));

                            let sid = scheduler.model.id_lookup.student.to_id(student.name);
                            let cid = scheduler.model.id_lookup.company.to_id(company.name);
                            let tid = scheduler.model.id_lookup.team.to_id(team.name);
                            let iid = scheduler.model.id_lookup.interviewer.to_id(interviewer.name);

                            let var_name = "var_" + sid + "_" + iid + "_" + timeslot;
                            var_names.push(var_name);

                            let is_student_pref = student.preferences.indexOf(team.name) > -1;
                            let is_team_pref = team.preferences.indexOf(student.name) > -1;

                            let num_allowed_student_prefs = _get_num_allowed_prefs([student.name], student.preferences);
                            let num_allowed_team_prefs = _get_num_allowed_prefs(team.preferences, [team.name]);

                            let over_val = _get_override_val(config.overrides, student.name, team.name);

                            let score = 0;
                            if (is_student_pref && is_team_pref) {
                                score += config.settings[scheduler.constants.IS_MUTUAL_PREF_SCORE];
                            } else if (is_student_pref) {
                                score += config.settings[scheduler.constants.IS_STUDENT_PREF_SCORE];
                            } else if (is_team_pref) {
                                score += config.settings[scheduler.constants.IS_TEAM_PREF_SCORE];
                            }

                            let difficulty_diff = student.difficulty - team.difficulty;
                            if (difficulty_diff === 2) {
                                score += config.settings[scheduler.constants.DIFFICULTY_DIFF_2_SCORE];
                            } else if (difficulty_diff === 1) {
                                score += config.settings[scheduler.constants.DIFFICULTY_DIFF_1_SCORE];
                            } else if (difficulty_diff === 0) {
                                score += config.settings[scheduler.constants.DIFFICULTY_DIFF_0_SCORE];
                            } else if (difficulty_diff === -1) {
                                score += config.settings[scheduler.constants.DIFFICULTY_DIFF_MINUS1_SCORE];
                            } else if (difficulty_diff === -2) {
                                score += config.settings[scheduler.constants.DIFFICULTY_DIFF_MINUS2_SCORE];
                            }

                            score += (2 * Math.random() - 1) * config.settings[scheduler.constants.RANDOM_SCORE_MAX];

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
                            _create_cnstrt_and_push(constraints_map, 'constraint_1', sid, var_name,
                                {
                                    min: config.settings[scheduler.constants.MIN_INTERVIEW_PER_STUDENT],
                                    max: config.settings[scheduler.constants.MAX_INTERVIEW_PER_STUDENT]
                                }
                            );

                            // make sure each interviewer has each slot filled at most once
                            _create_cnstrt_and_push(constraints_map, 'constraint_2', iid + "_" + timeslot, var_name, { max: 1 });

                            // make sure each interviewer has at least n interviews
                            _create_cnstrt_and_push(constraints_map, 'constraint_3', iid, var_name,
                                {
                                    min: config.settings[scheduler.constants.MIN_INTERVIEW_PER_INTERVIEWER]
                                }
                            );

                            // make sure each student is in each timestot at most once
                            _create_cnstrt_and_push(constraints_map, 'constraint_4', sid + "_" + timeslot, var_name, { max: 1 });

                            // make sure each student interviews with each company at most n times
                            _create_cnstrt_and_push(constraints_map, 'constraint_5', sid + "_" + cid, var_name,
                                {
                                        max: config.settings[scheduler.constants.MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT]
                                }
                            );

                            // make sure each student interviews with each team at most once
                            _create_cnstrt_and_push(constraints_map, 'constraint_6', sid + "_" + tid, var_name, { max: 1 });

                            // make sure each student interviews with at least n of their preferences
                            if (is_student_pref && (over_val === null || over_val)) {
                                _create_cnstrt_and_push(constraints_map, 'constraint_7', sid, var_name,
                                    {
                                        min: Math.min(
                                            config.settings[scheduler.constants.MIN_STUDENT_PREFS_GUARANTEED],
                                            num_allowed_student_prefs
                                        )
                                    }
                                );
                            }

                            // make sure each team interviews with at least n of their preferences
                            if (is_team_pref && (over_val === null || over_val)) {
                                _create_cnstrt_and_push(constraints_map, 'constraint_8', tid, var_name,
                                    {
                                        min: Math.min(
                                            config.settings[scheduler.constants.MIN_TEAM_PREFS_GUARANTEED_PER_POSITION] * team.positions,
                                            num_allowed_team_prefs
                                        )
                                    }
                                );
                            }

                            // if preferences align, make sure interview occurs
                            if (config.settings[scheduler.constants.REQUIRE_MUTUAL_PREFS_TO_INTERVIEW] && is_student_pref && is_team_pref && (over_val === null || over_val)) {
                                _create_cnstrt_and_push(constraints_map, 'constraint_9', sid + "_" + tid, var_name, { min: 1 });
                            }

                            // add in overwrites
                            if (over_val !== null){
                                _create_cnstrt_and_push(constraints_map, 'constraint_10', sid + "_" + tid, var_name, { equal: over_val ? 1 : 0 });
                            }

                            // time windows
                            for (let idx_window = 0; idx_window < timeslot_to_window_map[timeslot].length; idx_window++) {
                                let window = timeslot_to_window_map[timeslot][idx_window];
                                _create_cnstrt_and_push(constraints_map, 'constraint_11', sid + "_" + window, var_name,
                                    {
                                        max: config.settings[scheduler.constants.MAX_INTERVIEW_PER_TIME_WINDOW]
                                    }
                                );
                            }

                            // make sure each student only has up to n interviews per day
                            _create_cnstrt_and_push(constraints_map, 'constraint_12', sid + "_" + day, var_name,
                                {
                                    max: config.settings[scheduler.constants.MAX_INTERVIEWS_PER_DAY]
                                }
                            );
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

        // Check for infeasible
        if (results.indexOf('PRIMAL_INFEASIBLE') >= 0) {
            solved_model = {
                is_feasible: false
            };
            return null;
        }

        // Check for error
        if (results.indexOf('PRIMAL_FEASIBLE') < 0) {
            // TODO: check for specific constraint presolved.
            return results;
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

        return null;
    };

    const _get_solved_model = function(data) {
        return new Promise((resolve, reject) => {
            if ($(data.documentElement).find("fault").length > 0) {
                throw 'Error submitting job: ' + $(data.documentElement).find('string').first().text();
            }

            let $d = $(data.documentElement).find("data");

            let job_num = $d.find('int').first().text();
            let job_pwd = $d.find('string').first().text();

            if (job_pwd.startsWith("Error: ")) {
                throw 'Error submitting job: ' + job_pwd;
            }

            console.log('Job Num: ' + job_num);
            console.log('Job Pwd: ' + job_pwd);

            let xml_rpc_results_request = '<methodCall><methodName>getFinalResults</methodName><params><param><value><int>' +
                job_num +
                '</int></value></param><param><value><string>' +
                job_pwd +
                '</string></value></param></params></methodCall>';

            $.post(scheduler.constants.NEOS_SERVER_ADDRESS, xml_rpc_results_request)
                .done(function(data) {
                    let error = _parse_solved_model(data);

                    if (error !== null) {
                        return reject('Error getting job results:\n' + error);
                    }
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
                "<email>" + scheduler.constants.NEOS_EMAIL_ADDRESS + "</email>" +
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

            $.post(scheduler.constants.NEOS_SERVER_ADDRESS, xml_rpc_submit_request)
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

        _add_val_if_not_exists(config, 'settings', {});
        const settings = config.settings;

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

        _add_val_if_not_exists(settings, scheduler.constants.MAX_INTERVIEWS_PER_DAY,
            scheduler.constants.DEFAULT_MAX_INTERVIEWS_PER_DAY);

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

        _add_val_if_not_exists(settings, scheduler.constants.RANDOM_SCORE_MAX,
            scheduler.constants.DEFAULT_RANDOM_SCORE_MAX);
    };

    const update_setting = function (setting_key, new_val) {
        solved_model = null;
        _var_name_to_data_map = null;
        config.settings[setting_key] = new_val;
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
            if (solved_model === null) {
                return reject('Cannot save because the schedule has not been recomputed.');
            }
            return resolve(solved_model.schedule);
        }).then(
            schedule_data => util.io.save_to_sheet('Interview Schedule', () => _save_schedule_to_array(schedule_data))
        );
    };

    const save_schedule_to_csv = function () {
        return new Promise((resolve, reject) => {
            if (solved_model === null) {
                return reject("Cannot save because the schedule has not been recomputed.");
            }
            return resolve(solved_model.schedule);
        }).then(
            schedule_data => util.io.save_to_csv(() => _save_schedule_to_array(schedule_data))
        );
    };

    const save_config_to_file = function () {
        return util.io.save_to_json(() => get_config());
    };

    return {
        init_module: init_module,
        set_config: set_config,
        get_config: get_config,
        update_setting: update_setting,
        get_solved_model: get_solved_model,
        update_overwrite: update_overwrite,
        save_schedule_to_sheets: save_schedule_to_sheets,
        save_schedule_to_csv: save_schedule_to_csv,
        save_config_to_file: save_config_to_file
    };
}());