placement.model = (function () {
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

    const load_scores_from_array = function(data_array) {
        solved_model = null;
        scores = [];
        id_to_score = {};

        for (let i = 1; i < data_array.length; i++) {
            let row = data_array[i];

            let overwrite = row.length >= 5 ? row[4].toLowerCase() : '';
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
                person_score: row[2],
                company_score: row[3],
                score: row[2] * row[3],
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

    const _save_placements_to_array = function(scores_array) {
        let values = [['Person', 'Company', 'Person Score', 'Company Score', 'Overwrite']];
        for (let i = 0; i < scores_array.length; i++) {
            let s = scores_array[i];
            values.push([
                s.person,
                s.company,
                s.person_score,
                s.company_score,
                s.overwrite === null ? s.overwrite : s.overwrite.toString()
            ]);
        }
        return values;
    };

    // // Todo: investigate failing save
    // const save_placements_to_sheets = function() {
    //     if (solved_model === null) {
    //         return new Promise(((resolve, reject) => {
    //             return reject("Cannot save because the placements have not been recomputed.");
    //         }));
    //     }
    //
    //     const resource_create = {
    //         properties: {
    //             title: 'Placements'
    //         }
    //     };
    //     const resource_update = {
    //         values: _save_placements_to_array(solved_model.placements)
    //     };
    //
    //     const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
    //     return new Promise((resolve, reject) => {
    //         sheets.spreadsheets.create({
    //             resource: resource_create,
    //             fields: 'spreadsheetId'
    //         }).then(function(spreadsheet) {
    //             sheets.spreadsheets.values.update({
    //                 spreadsheetId: spreadsheet.data.spreadsheetId,
    //                 range: 'A:E',
    //                 valueInputOption: 'RAW',
    //                 resource: resource_update
    //             }).then(function (result) {
    //                 return resolve('Placements saved with spreadsheetId ' + spreadsheet.data.spreadsheetId);
    //             }).catch(function (err) {
    //                 return reject("Error io placements to new spreadsheet: " + err);
    //             })
    //         }).catch(function(err) {
    //             return reject("Error creating new spreadsheet for placements: " + err);
    //         })
    //     });
    // };

    const save_placements_to_csv = function() {
        return new Promise((resolve, reject) => {
            if (solved_model === null) {
                reject("Cannot save because the placements have not been recomputed.");
            }
            resolve(solved_model.placements);
        }).then(
            placements_data => util.io.save_to_csv(() => _save_placements_to_array(placements_data))
        );
    };

    return {
        init_module: init_module,
        get_scores: get_scores,
        load_scores_from_array: load_scores_from_array,
        update_overwrite: update_overwrite,
        get_solved_model: get_solved_model,
        save_placements_to_csv: save_placements_to_csv
    };
}());