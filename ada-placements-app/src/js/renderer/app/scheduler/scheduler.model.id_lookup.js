scheduler.model.id_lookup = (function () {
    let id_to_name;
    let name_to_id;

    const init_module = function () {
        id_to_name = null;
        name_to_id = null;
    };

    const create_id_lookup = function () {
        return new Promise((resolve, reject) => {
            const config = scheduler.model.get_config();
            id_to_name = {
                student: {},
                company: {},
                team: {},
                interviewer: {}
            };
            name_to_id = {
                student: {},
                company: {},
                team: {},
                interviewer: {}
            };

            let tid = 0;
            let iid = 0;
            for (let i = 0; i < config.companies.length; i++) {
                const company = config.companies[i];

                id_to_name.company['c' + i] = company.name;
                name_to_id.company[company.name] = 'c' + i;

                for (let j = 0; j < company.teams.length; j++) {
                    const team = company.teams[j];

                    id_to_name.team['t' + tid] = team.name;
                    name_to_id.team[team.name] = 't' + tid;
                    tid++;

                    for (let k = 0; k < team.interviewers.length; k++) {
                        const interviewer = team.interviewers[k];

                        id_to_name.interviewer['i' + iid] = interviewer.name;
                        name_to_id.interviewer[interviewer.name] = 'i' + iid;
                        iid++;
                    }
                }
            }

            for (let i = 0; i < config.students.length; i++) {
                const student = config.students[i];

                id_to_name.student['s' + i] = student.name;
                name_to_id.student[student.name] = 's' + i;
            }

            return resolve();
        });
    };

    return {
        init_module: init_module,
        create_id_lookup: create_id_lookup,
        student: {
            to_name: function (id) {
                return id_to_name.student[id];
            },
            to_id: function (name) {
                return name_to_id.student[name];
            }
        },
        company: {
            to_name: function (id) {
                return id_to_name.company[id];
            },
            to_id: function (name) {
                return name_to_id.company[name];
            }
        },
        team: {
            to_name: function (id) {
                return id_to_name.team[id];
            },
            to_id: function (name) {
                return name_to_id.team[name];
            }
        },
        interviewer: {
            to_name: function (id) {
                return id_to_name.interviewer[id];
            },
            to_id: function (name) {
                return name_to_id.interviewer[name];
            }
        }
    };
}());