module.exports = {
    NEOS_SERVER_ADDRESS: "https://neos-server.org:3333",
    NEOS_EMAIL_ADDRESS: "emma@adadevelopersacademy.org",

    // constraints
    MAX_INTERVIEW_PER_STUDENT: "max_interviews_per_student",
    DEFAULT_MAX_INTERVIEW_PER_STUDENT: 6,
    MIN_INTERVIEW_PER_STUDENT: "min_interviews_per_student",
    DEFAULT_MIN_INTERVIEW_PER_STUDENT: 6,
    MIN_INTERVIEW_PER_INTERVIEWER: "min_interviews_per_interviewer",
    DEFAULT_MIN_INTERVIEW_PER_INTERVIEWER: 6,
    MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT: "max_interviews_at_company_per_student",
    DEFAULT_MAX_INTERVIEWS_AT_COMPANY_PER_STUDENT: 2,
    MIN_STUDENT_PREFS_GUARANTEED: "min_student_prefs_guaranteed",
    DEFAULT_MIN_STUDENT_PREFS_GUARANTEED: 1,
    MIN_TEAM_PREFS_GUARANTEED_PER_POSITION: "min_team_prefs_guaranteed_per_position",
    DEFAULT_MIN_TEAM_PREFS_GUARANTEED_PER_POSITION: 1,
    REQUIRE_MUTUAL_PREFS_TO_INTERVIEW: "require_mutual_pres_to_interview",
    DEFAULT_REQUIRE_MUTUAL_PREFS_TO_INTERVIEW: true,
    TIME_WINDOW_SIZE: "time_window_size",
    DEFAULT_TIME_WINDOW_SIZE: 2,
    MAX_INTERVIEW_PER_TIME_WINDOW: "max_interviews_per_time_window",
    DEFAULT_MAX_INTERVIEW_PER_TIME_WINDOW: 1,
    MAX_INTERVIEWS_PER_DAY: "max_interviews_per_day",
    DEFAULT_MAX_INTERVIEWS_PER_DAY: 3,

    // scoring
    DIFFICULTY_DIFF_2_SCORE: "difficulty_diff_2_score",
    DEFAULT_DIFFICULTY_DIFF_2_SCORE: 5,
    DIFFICULTY_DIFF_1_SCORE: "difficulty_diff_1_score",
    DEFAULT_DIFFICULTY_DIFF_1_SCORE: 1,
    DIFFICULTY_DIFF_0_SCORE: "difficulty_diff_0_score",
    DEFAULT_DIFFICULTY_DIFF_0_SCORE: 0,
    DIFFICULTY_DIFF_MINUS1_SCORE: "difficulty_diff_minus1_score",
    DEFAULT_DIFFICULTY_DIFF_MINUS1_SCORE: -5,
    DIFFICULTY_DIFF_MINUS2_SCORE: "difficulty_diff_minus2_score",
    DEFAULT_DIFFICULTY_DIFF_MINUS2_SCORE: -25,

    IS_STUDENT_PREF_SCORE: "is_student_pref_score",
    DEFAULT_IS_STUDENT_PREF_SCORE: 1,
    IS_TEAM_PREF_SCORE: "is_team_pref_score",
    DEFAULT_IS_TEAM_PREF_SCORE: 4,
    IS_MUTUAL_PREF_SCORE: "is_mutual_pref_score",
    DEFAULT_IS_MUTUAL_PREF_SCORE: 6,

    RANDOM_SCORE_MAX: "random_score_max",
    DEFAULT_RANDOM_SCORE_MAX: 0.0
};