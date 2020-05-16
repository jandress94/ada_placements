scheduler.model.validation = (function () {

    const validate_config = function () {
        return new Promise((resolve, reject) => {
            const config = scheduler.model.get_config();

            // ensure timeslots structure is correct
            if (!config.hasOwnProperty('timeslots')) {
                return reject('The config is missing the "timeslots" field.');
            }

            let all_timeslots = [];
            for (let i = 0; i < config.timeslots.length; i++) {
                const day = config.timeslots[i];
                if (!day.hasOwnProperty("day")) {
                    return reject('Timeslot index ' + i + ' is missing the "day" field');
                }
                if (!day.hasOwnProperty("times")) {
                    return reject('Timeslot index ' + i + ' is missing the "times" field');
                }
                for (let j = 0; j < day.times.length; j++) {
                    const timeslot = day.day + "_" + day.times[j];
                    if (all_timeslots.includes(timeslot)) {
                        return reject('Timeslot ' + timeslot + ' appears multiple times in the timeslot definitions')
                    } else {
                        all_timeslots.push(timeslot);
                    }
                }
            }

            // ensure companies structure is correct
            if (!config.hasOwnProperty('companies')) {
                return reject('The config is missing the "companies" field.');
            }

            let all_companies = [];
            let all_teams = [];
            let all_interviewers = [];
            for (let i = 0; i < config.companies.length; i++) {
                const company = config.companies[i];
                if (!company.hasOwnProperty("name")) {
                    return reject('Company index ' + i + ' is missing the "name" field');
                }
                if (!company.hasOwnProperty("teams")) {
                    return reject('Company index ' + i + ' is missing the "teams" field');
                }

                if (all_companies.includes(company.name)) {
                    return reject('Company ' + company.name + ' appears multiple times in the company definitions');
                } else {
                    all_companies.push(company.name);
                }

                for (let j = 0; j < company.teams.length; j++) {
                    const team = company.teams[j];
                    if (!team.hasOwnProperty("name")) {
                        return reject('Company index ' + i + ', Team index ' + j + ' is missing the "name" field');
                    }
                    if (!team.hasOwnProperty("positions")) {
                        return reject('Company index ' + i + ', Team index ' + j + ' is missing the "positions" field');
                    }
                    if (!team.hasOwnProperty("difficulty")) {
                        return reject('Company index ' + i + ', Team index ' + j + ' is missing the "difficulty" field');
                    }
                    if (!team.hasOwnProperty("preferences")) {
                        return reject('Company index ' + i + ', Team index ' + j + ' is missing the "preferences" field');
                    }
                    if (!team.hasOwnProperty("interviewers")) {
                        return reject('Company index ' + i + ', Team index ' + j + ' is missing the "interviewers" field');
                    }

                    if (all_teams.includes(team.name)) {
                        return reject('Team ' + team.name + ' appears multiple times in the company definitions');
                    } else {
                        all_teams.push(team.name);
                    }

                    for (let k = 0; k < team.interviewers.length; k++) {
                        const interviewer = team.interviewers[k];
                        if (!interviewer.hasOwnProperty("name")) {
                            return reject('Company index ' + i + ', Team index ' + j +
                                ', Interviewer index ' + k + ' is missing the "name" field');
                        }
                        if (!interviewer.hasOwnProperty("timeslots")) {
                            return reject('Company index ' + i + ', Team index ' + j +
                                ', Interviewer index ' + k + ' is missing the "timeslots" field');
                        }

                        if (all_interviewers.includes(interviewer.name)) {
                            return reject('Interviewer ' + interviewer.name + ' appears multiple times in the company definitions');
                        } else {
                            all_interviewers.push(interviewer.name);
                        }
                    }
                }
            }

            // ensure students structure is correct
            if (!config.hasOwnProperty('students')) {
                return reject('The config is missing the "students" field.');
            }

            let all_students = [];
            for (let i = 0; i < config.students.length; i++) {
                const student = config.students[i];
                if (!student.hasOwnProperty("name")) {
                    return reject('Student index ' + i + ' is missing the "name" field');
                }
                if (!student.hasOwnProperty("difficulty")) {
                    return reject('Student index ' + i + ' is missing the "difficulty" field');
                }
                if (!student.hasOwnProperty("preferences")) {
                    return reject('Student index ' + i + ' is missing the "preferences" field');
                }

                if (all_students.includes(student.name)) {
                    return reject('Student ' + student.name + ' appears multiple times in the student definitions');
                } else {
                    all_students.push(student.name);
                }
            }

            // ensure overrides structure is correct
            if (!config.hasOwnProperty('overrides')) {
                return reject('The config is missing the "overrides" field.');
            }

            let all_overrides = [];
            for (let i = 0; i < config.overrides.length; i++) {
                const override = config.overrides[i];
                if (!override.hasOwnProperty("person")) {
                    return reject('Override index ' + i + ' is missing the "person" field');
                }
                if (!override.hasOwnProperty("team")) {
                    return reject('Override index ' + i + ' is missing the "team" field');
                }
                if (!override.hasOwnProperty("value")) {
                    return reject('Override index ' + i + ' is missing the "value" field');
                }

                const override_concat = override.person + "_over_" + override.team;
                if (all_overrides.includes(override_concat)) {
                    return reject('Override for (' + override.person + ', ' + override.team +
                        ') appears multiple times in the override definitions');
                } else {
                    all_overrides.push(override_concat);
                }
            }

            // ensure all listed interview timeslots appear in timeslot definitions
            for (let i = 0; i < config.companies.length; i++) {
                const company = config.companies[i];
                for (let j = 0; j < company.teams.length; j++) {
                    const team = company.teams[j];
                    for (let k = 0; k < team.interviewers.length; k++) {
                        const interviewer = team.interviewers[k];
                        for (let l = 0; l < interviewer.timeslots.length; l++) {
                            if (!all_timeslots.includes(interviewer.timeslots[l])) {
                                return reject('Company ' + i + ', Team ' + j + ', Interviewer ' + k +
                                    ' has the timeslot ' + interviewer.timeslots[l] +
                                    ' which is not listed in the "timeslots"');
                            }
                        }
                    }
                }
            }

            // ensure all listed students appear in student definitions
            for (let i = 0; i < config.companies.length; i++) {
                const company = config.companies[i];
                for (let j = 0; j < company.teams.length; j++) {
                    const team = company.teams[j];
                    for (let k = 0; k < team.preferences.length; k++) {
                        if (!all_students.includes(team.preferences[k])) {
                            return reject('Company ' + i + ', Team ' + j + ' has the student preference ' +
                                team.preferences[k] + ' which is not listed in the "students"');
                        }
                    }
                }
            }
            for (let i = 0; i < config.overrides.length; i++) {
                if (!all_students.includes(config.overrides[i].person)) {
                    return reject('Override ' + i + ' has the student ' + config.overrides[i].person +
                        ' which is not listed in the "students"');
                }
            }

            // ensure all listed teams appear in the company team definitions
            for (let i = 0; i < config.students.length; i++) {
                const student = config.students[i];
                for (let j = 0; j < student.preferences.length; j++) {
                    if (!all_teams.includes(student.preferences[j])) {
                        return reject('Student ' + i + ' has the preference ' + student.preferences[j] +
                            ' which is not listed in the teams');
                    }
                }
            }
            for (let i = 0; i < config.overrides.length; i++) {
                if (!all_teams.includes(config.overrides[i].team)) {
                    return reject('Override ' + i + ' has the team ' + config.overrides[i].team +
                        ' which is not listed in the teams');
                }
            }

            return resolve();
        });
    };

    return {
        validate_config: validate_config,
    };
}());