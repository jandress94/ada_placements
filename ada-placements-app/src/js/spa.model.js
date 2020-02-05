const fs = require("fs");
const parse = require('csv-parse/lib/sync');
const solver = require("javascript-lp-solver/src/solver");

spa.model = (function () {
    let scores;
    let solved_model;

    const init_module = function () {
        scores = null;
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

            scores.push({
                person: row[0],
                company: row[1],
                score: row[2],
                overwrite: overwrite
            });
        }
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

        solved_model = solved_model_raw;
    };

    return {
        init_module: init_module,
        get_scores: get_scores,
        get_solved_model: get_solved_model,
        load_scores_from_file: load_scores_from_file
    };
}());