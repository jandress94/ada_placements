const fs = require("fs");
const parse = require('csv-parse/lib/sync');
const solver = require("javascript-lp-solver/src/solver");

spa.model = (function () {
    let scores;
    let id_to_score;
    let solved_model;

    const init_module = function () {
        scores = null;
        id_to_score = null;
        solved_model = null;
    };

    const get_scores = function () {
        return scores;
    };

    const get_solved_model = function () {
        if (solved_model == null) {
            solve_model();
        }
        return solved_model;
    };
    
    const load_scores_from_file = function (filepath) {
        solved_model = null;

        let data_csv_raw = fs.readFileSync(filepath);
        let data_csv_parsed = parse(data_csv_raw.toString(), {
           cast: true,
           columns: false,
           skip_empty_lines: true
        });

        scores = [];
        id_to_score = {};
        for (let i = 1; i < data_csv_parsed.length; i++) {
            let row = data_csv_parsed[i];

            let overwrite = row[3].toLowerCase();
            if (overwrite === '') {
                overwrite = null;
            } else if (overwrite === 'true') {
                overwrite = true;
            } else if (overwrite === 'false') {
                overwrite = false;
            } else {
                throw '"' + overwrite + '" is not a valid value for the overwrite column';
            }

            let score_entry = {
                id: i - 1,
                person: row[0],
                company: row[1],
                score: row[2],
                overwrite: overwrite
            };

            id_to_score[score_entry.id] = score_entry;

            scores.push(score_entry);
        }
    };

    const update_overwrite = function (score_id, new_val) {
        solved_model = null;
        id_to_score[score_id].overwrite = new_val;
    };

    const solve_model = function () {
        let intVars = {};
        let variables = {};
        let constraints = {};

        for (let i = 0; i < scores.length; i++) {
            let r = scores[i];
            let personCompanyVar = "var_" + r.person + "_" + r.company;
            let personConstraint = "person_" + r.person;
            let companyConstraint = "company_" + r.company;
            let overwriteConstraint = "overwrite_" + r.person + "_" + r.company;

            variables[personCompanyVar] = {
                id: r.id,
                [personConstraint]: 1,
                [companyConstraint]: 1,
                [overwriteConstraint]: 1,
                score: r.score
            };

            if (r.overwrite != null) {
                constraints[overwriteConstraint] = { equal: r.overwrite ? 1 : 0 };
            }

            intVars[personCompanyVar] = 1;

            if (!constraints.hasOwnProperty(personConstraint)) {
                constraints[personConstraint] = { equal: 1 };
            }

            if (!constraints.hasOwnProperty(companyConstraint)) {
                constraints[companyConstraint] = { equal: 1 };
            }
        }

        let solved_model_raw = solver.Solve({
            optimize: "score",
            opType: 'max',
            constraints: constraints,
            variables: variables,
            ints: intVars
        });

        console.log(solved_model_raw);

        solved_model = {
            is_feasible: solved_model_raw.feasible
        };

        if (solved_model_raw.feasible) {
            solved_model.score = solved_model_raw.result;
            solved_model.placements = [];

            for (const key in solved_model_raw) {
                if (!solved_model_raw.hasOwnProperty(key)) {
                    continue;
                }

                if (variables.hasOwnProperty(key)) {
                    solved_model.placements.push(id_to_score[variables[key].id]);
                }
            }
        }
    };

    return {
        init_module: init_module,
        get_scores: get_scores,
        update_overwrite: update_overwrite,
        get_solved_model: get_solved_model,
        load_scores_from_file: load_scores_from_file
    };
}());