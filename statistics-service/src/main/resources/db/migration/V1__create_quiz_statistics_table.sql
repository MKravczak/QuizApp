CREATE TABLE IF NOT EXISTS quiz_statistics (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    duration_in_seconds BIGINT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_statistics_quiz_id ON quiz_statistics(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_statistics_user_id ON quiz_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_statistics_quiz_id_user_id ON quiz_statistics(quiz_id, user_id); 