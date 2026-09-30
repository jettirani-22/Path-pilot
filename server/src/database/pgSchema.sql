-- ============================================
-- PATHPILOT POSTGRESQL PRODUCTION SCHEMA
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    icon TEXT,
    requires_coding INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS difficulty_levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    difficulty_id INTEGER NOT NULL REFERENCES difficulty_levels(id) ON DELETE CASCADE,
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_course_diff_task UNIQUE (course_id, difficulty_id, task_number)
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    difficulty_id INTEGER NOT NULL REFERENCES difficulty_levels(id) ON DELETE CASCADE,
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
    question_type TEXT DEFAULT 'mcq', -- 'mcq', 'practical', 'code', 'reassessment'
    code_language TEXT,
    starter_code TEXT,
    expected_output TEXT,
    test_cases TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    difficulty_id INTEGER NOT NULL REFERENCES difficulty_levels(id) ON DELETE CASCADE,
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
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    task_number INTEGER,
    selected_answer TEXT,
    correct INTEGER DEFAULT 0,
    marks_awarded INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS student_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    difficulty_id INTEGER NOT NULL REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER NOT NULL DEFAULT 10,
    is_unlocked INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_user_course_difficulty UNIQUE (user_id, course_id, difficulty_id)
);

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    difficulty_id INTEGER NOT NULL REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    level_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_badge_user_course_level UNIQUE (user_id, course_id, difficulty_id)
);

CREATE TABLE IF NOT EXISTS exam_violations (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES test_attempts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL,
    details TEXT,
    occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS career_fit_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_id INTEGER NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    career_name TEXT NOT NULL,
    fit_percentage REAL DEFAULT 0,
    strengths TEXT,
    areas_to_improve TEXT,
    recommended_skills TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Safe migrations for existing columns if tables already existed
DO $$
BEGIN
    BEGIN
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS task_number INTEGER DEFAULT 1;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT 'General';
        ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS task_number INTEGER DEFAULT 1;
        ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS is_cancelled INTEGER DEFAULT 0;
        ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
        ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS violation_count INTEGER DEFAULT 0;
        ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS camera_verified INTEGER DEFAULT 0;
        ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS assigned_questions TEXT;
        ALTER TABLE attempt_answers ADD COLUMN IF NOT EXISTS task_number INTEGER;
    EXCEPTION
        WHEN others THEN NULL;
    END;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_diff_task ON questions(course_id, difficulty_id, task_number);
CREATE INDEX IF NOT EXISTS idx_tasks_course_diff ON tasks(course_id, difficulty_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_violations_attempt ON exam_violations(attempt_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
