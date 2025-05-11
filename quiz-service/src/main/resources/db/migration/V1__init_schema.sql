-- Utworzenie schematu quizzes jeśli nie istnieje
CREATE SCHEMA IF NOT EXISTS quizzes;

-- Tabela quizzes
CREATE TABLE IF NOT EXISTS quizzes.quizzes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    question_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela quiz_questions
CREATE TABLE IF NOT EXISTS quizzes.quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes.quizzes(id) ON DELETE CASCADE,
    question VARCHAR(255) NOT NULL,
    answers TEXT[] NOT NULL,
    correct_answer_index INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes.quizzes(id)
);

-- Tabela quiz_results
CREATE TABLE IF NOT EXISTS quizzes.quiz_results (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes.quizzes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    duration_in_seconds BIGINT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_result FOREIGN KEY (quiz_id) REFERENCES quizzes.quizzes(id)
); 