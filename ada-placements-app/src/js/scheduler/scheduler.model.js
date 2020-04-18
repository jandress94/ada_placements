scheduler.model = (function () {
    let config;
    let solved_model;

    const init_module = function () {
        config = null;
        solved_model = null;
    };

    const get_solved_model = function () {
        if (solved_model == null) {
            _solve_model();
        }
        return solved_model;
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

    const _solve_model = function () {
        let variables = {};
        let constraints = {};
        let intVars = {};

        let company_configs = config[scheduler.constants.COMPANIES];
        let student_configs = config[scheduler.constants.STUDENTS];
        let timeslot_to_window_map = _create_window_mappings(config[scheduler.constants.TIMESLOTS]);

        for (let idx_company = 0; idx_company < company_configs.length; idx_company++) {
          let company = company_configs[idx_company];

          for (let idx_team = 0; idx_team < company.teams.length; idx_team++) {
            let team = company.teams[idx_team];
        
            for (let idx_int = 0; idx_int < team.interviewers.length; idx_int++) {
              let interviewer = team.interviewers[idx_int];

              for (let idx_slot = 0; idx_slot < interviewer.timeslots.length; idx_slot++) {
                let timeslot = interviewer.timeslots[idx_slot];

                for (let idx_student = 0; idx_student < student_configs.length; idx_student++) {
                  let student = student_configs[idx_student];

                  let var_name = "var_" + student.name + "_" + interviewer.name + "_" + timeslot;
                  let is_student_pref = student.preferences.indexOf(team.name) > -1;
                  let is_team_pref = team.preferences.indexOf(student.name) > -1;

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

                  variables[var_name] = {
                    student_name: student.name,
                    company_name: company.name,
                    team_name: team.name,
                    interviewer_name: interviewer.name,
                    timeslot: timeslot,
                    is_student_pref: is_student_pref,
                    is_team_pref: is_team_pref,
                    difficulty_diff: difficulty_diff,
                    score: score
                  };

                  intVars[var_name] = 1;

                  // make sure each student interviews with at most n teams
                  let cnstrt_student_interviews_max = "c1_" + student.name;
                  constraints[cnstrt_student_interviews_max] = { max: config[scheduler.constants.SETTINGS][scheduler.constants.MAX_INTERVIEW_PER_STUDENT] };
                  variables[var_name][cnstrt_student_interviews_max] = 1;

                  // make sure each student interviews with at least n teams
                  let cnstrt_student_interviews_min = "c2_" + student.name;
                  constraints[cnstrt_student_interviews_min] = { min: config[scheduler.constants.SETTINGS][scheduler.constants.MIN_INTERVIEW_PER_STUDENT] };
                  variables[var_name][cnstrt_student_interviews_min] = 1;

                  // make sure each interviewer has each slot filled at most once
                  let cnstrt_interviewer_slot_once = "c3_" + interviewer.name + "_" + timeslot;
                  constraints[cnstrt_interviewer_slot_once] = { max: 1 };
                  variables[var_name][cnstrt_interviewer_slot_once] = 1;

                  // make sure each interviewer has at least n interviews
                  let cnstrt_interviewer_min_interviews = "c4_" + interviewer.name;
                  constraints[cnstrt_interviewer_min_interviews] = { min: config[scheduler.constants.SETTINGS][scheduler.constants.MIN_INTERVIEW_PER_INTERVIEWER] };
                  variables[var_name][cnstrt_interviewer_min_interviews] = 1;

                  // make sure each student is in each timestot at most once
                  let cnstrt_student_slot = "c5_" + student.name + "_" + timeslot;
                  constraints[cnstrt_student_slot] = { max: 1 };
                  variables[var_name][cnstrt_student_slot] = 1;

                  // make sure each student interviews with each company at most n times
                  let cnstrt_student_company = "c6_" + student.name + "_" + company.name;
                  constraints[cnstrt_student_company] = { max: config[scheduler.constants.SETTINGS][scheduler.constants.MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT] };
                  variables[var_name][cnstrt_student_company] = 1;

                  // make sure each student interviews with each team at most once
                  let cnstrt_student_team = "c7_" + student.name + "_" + team.name;
                  constraints[cnstrt_student_team] = { max: 1 };
                  variables[var_name][cnstrt_student_team] = 1;

                  // make sure each student interviews with at least n of their preferences
                  let cnstrt_student_pref = "c8_" + student.name;
                  constraints[cnstrt_student_pref] = {
                      min: Math.min(
                          config[scheduler.constants.SETTINGS][scheduler.constants.MIN_STUDENT_PREFS_GUARANTEED],
                          student.preferences.length
                      )
                  };
                  variables[var_name][cnstrt_student_pref] = is_student_pref ? 1 : 0;

                  // make sure each team interviews with at least n of their preferences
                  let cnstrt_team_pref = "c9_" + team.name;
                  constraints[cnstrt_team_pref] = {
                      min: Math.min(
                          config[scheduler.constants.SETTINGS][scheduler.constants.MIN_TEAM_PREFS_GUARANTEED_PER_POSITION] * team.positions,
                          team.preferences.length
                      )
                  };
                  variables[var_name][cnstrt_team_pref] = is_team_pref ? 1 : 0;

                  // if preferences align, make sure interview occurs
                  if (config[scheduler.constants.SETTINGS][scheduler.constants.REQUIRE_MUTUAL_PREFS_TO_INTERVIEW]) {
                      let cnstrt_pref_aligned = "c10_" + student.name + "_" + team.name;
                      constraints[cnstrt_pref_aligned] = {min: (is_student_pref && is_team_pref) ? 1 : 0};
                      variables[var_name][cnstrt_pref_aligned] = 1;
                  }

                  // add in overwrites
                  let cnstrt_overwrite = "c11_" + student.name + "_" + team.name;
                  let over_val = _get_override_val(config[scheduler.constants.OVERRIDES], student.name, team.name);
                  if (over_val != null) {
                    constraints[cnstrt_overwrite] = { equal: over_val ? 1 : 0 };
                    variables[var_name]['is_override'] = over_val;
                  }
                  variables[var_name][cnstrt_overwrite] = 1;

                  // time windows
                  for (let idx_window = 0; idx_window < timeslot_to_window_map[timeslot].length; idx_window++) {
                    let window = timeslot_to_window_map[timeslot][idx_window];
                    let constrt_window = "c12_" + student.name + "_" + window;
                    constraints[constrt_window] = { max: config[scheduler.constants.SETTINGS][scheduler.constants.MAX_INTERVIEW_PER_TIME_WINDOW] };
                    variables[var_name][constrt_window] = 1;
                  }
                }
              }
            }
          }
        }

        console.log(config);

        let model_input = {
            optimize: 'score',
            opType: 'max',
            constraints: constraints,
            variables: variables,
            ints: intVars
        };
        let solved_model_raw = solver.Solve(model_input);

        console.log(solved_model_raw);

        solved_model = {
            is_feasible: solved_model_raw.feasible
        };

        if (solved_model_raw.feasible) {
            solved_model.score = solved_model_raw.result;
            solved_model.schedule = [];

            for (const key in solved_model_raw) {
                if (!solved_model_raw.hasOwnProperty(key)) {
                    continue;
                }

                if (variables.hasOwnProperty(key)) {
                    solved_model.schedule.push({
                        student_name: variables[key].student_name,
                        company_name: variables[key].company_name,
                        team_name: variables[key].team_name,
                        interviewer_name: variables[key].interviewer_name,
                        timeslot: variables[key].timeslot,
                        is_student_pref: variables[key].is_student_pref,
                        is_team_pref: variables[key].is_team_pref,
                        difficulty_diff: variables[key].difficulty_diff,
                        is_override: variables[key].is_override,
                        score: variables[key].score
                    });
                }
            }
        }
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
        config = JSON.parse(fs.readFileSync(configUrl, 'utf8'));
        _add_default_settings();
    };

    const update_setting = function (setting_key, new_val) {
        solved_model = null;
        config[scheduler.constants.SETTINGS][setting_key] = new_val;
    };

    const get_config = function () {
        return config;
    };

    return {
        init_module: init_module,
        load_config_json: load_config_json,
        get_config: get_config,
        update_setting: update_setting,
        get_solved_model: get_solved_model
    };
}());