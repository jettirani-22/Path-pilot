PRAGMA foreign_keys = ON;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- ============================================
-- COURSES / CAREERS
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    icon TEXT,
    requires_coding INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DIFFICULTY LEVELS
-- ============================================
CREATE TABLE IF NOT EXISTS difficulty_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL
);

-- ============================================
-- QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,

    question TEXT NOT NULL,

    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,

    correct_answer TEXT NOT NULL,
    explanation TEXT,

    marks INTEGER DEFAULT 1,

    question_type TEXT DEFAULT 'mcq',

    code_language TEXT,
    starter_code TEXT,
    expected_output TEXT,
    test_cases TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    FOREIGN KEY (difficulty_id)
        REFERENCES difficulty_levels(id)
        ON DELETE CASCADE
);

-- ============================================
-- TEST ATTEMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS test_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,

    score INTEGER DEFAULT 0,
    total_marks INTEGER DEFAULT 0,

    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,

    accuracy REAL DEFAULT 0,

    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    FOREIGN KEY (difficulty_id)
        REFERENCES difficulty_levels(id)
        ON DELETE CASCADE
);

-- ============================================
-- ATTEMPT ANSWERS
-- ============================================
CREATE TABLE IF NOT EXISTS attempt_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,

    selected_answer TEXT,
    correct INTEGER DEFAULT 0,
    marks_awarded INTEGER DEFAULT 0,

    FOREIGN KEY (attempt_id)
        REFERENCES test_attempts(id)
        ON DELETE CASCADE,

    FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
);

-- ============================================
-- CAREER FIT INSIGHTS
-- ============================================
CREATE TABLE IF NOT EXISTS career_fit_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,
    attempt_id INTEGER NOT NULL,

    career_name TEXT NOT NULL,
    fit_percentage REAL DEFAULT 0,

    strengths TEXT,
    areas_to_improve TEXT,
    recommended_skills TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (attempt_id)
        REFERENCES test_attempts(id)
        ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_questions_course
ON questions(course_id);

CREATE INDEX IF NOT EXISTS idx_questions_difficulty
ON questions(difficulty_id);

CREATE INDEX IF NOT EXISTS idx_attempts_user
ON test_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt
ON attempt_answers(attempt_id);

CREATE INDEX IF NOT EXISTS idx_career_fit_user
ON career_fit_results(user_id);
CREATE TABLE IF NOT EXISTS email_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    otp_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email
ON email_verifications(email);