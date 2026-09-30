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
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,
    task_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    task_type TEXT NOT NULL DEFAULT 'conceptual', -- 'conceptual', 'practical', 'coding', 'reassessment'
    description TEXT,
    instructions TEXT,
    video_url TEXT,
    marks INTEGER DEFAULT 10,
    starter_code TEXT,
    expected_output TEXT,
    test_cases TEXT,
    code_language TEXT DEFAULT 'javascript',
    passing_score INTEGER DEFAULT 60,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (difficulty_id) REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    UNIQUE (course_id, difficulty_id, task_number)
);

-- ============================================
-- QUESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,
    task_number INTEGER DEFAULT 1,
    topic TEXT DEFAULT 'General',
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
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (difficulty_id) REFERENCES difficulty_levels(id) ON DELETE CASCADE
);

-- ============================================
-- TEST ATTEMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS test_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,
    task_number INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    total_marks INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    accuracy REAL DEFAULT 0,
    is_cancelled INTEGER DEFAULT 0,
    cancellation_reason TEXT,
    violation_count INTEGER DEFAULT 0,
    camera_verified INTEGER DEFAULT 0,
    assigned_questions TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (difficulty_id) REFERENCES difficulty_levels(id) ON DELETE CASCADE
);

-- ============================================
-- ATTEMPT ANSWERS
-- ============================================
CREATE TABLE IF NOT EXISTS attempt_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER,
    task_number INTEGER,
    selected_answer TEXT,
    correct INTEGER DEFAULT 0,
    marks_awarded INTEGER DEFAULT 0,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ============================================
-- STUDENT PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER NOT NULL DEFAULT 10,
    is_unlocked INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    completed_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (difficulty_id) REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id, difficulty_id)
);

-- ============================================
-- BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    difficulty_id INTEGER NOT NULL,
    badge_name TEXT NOT NULL,
    level_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (difficulty_id) REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    UNIQUE (user_id, course_id, difficulty_id)
);

-- ============================================
-- EXAM VIOLATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS exam_violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER,
    user_id INTEGER NOT NULL,
    violation_type TEXT NOT NULL,
    details TEXT,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SYSTEM SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE
);

-- ============================================
-- EMAIL VERIFICATIONS
-- ============================================
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

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_diff_task ON questions(course_id, difficulty_id, task_number);
CREATE INDEX IF NOT EXISTS idx_tasks_course_diff ON tasks(course_id, difficulty_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_attempt ON exam_violations(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_career_fit_user ON career_fit_results(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);