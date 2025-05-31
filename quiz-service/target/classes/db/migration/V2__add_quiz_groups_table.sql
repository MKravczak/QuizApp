-- Dodanie tabeli quiz_groups dla relacji many-to-many między quizami a grupami
CREATE TABLE quiz_groups (
    quiz_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    PRIMARY KEY (quiz_id, group_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Dodanie indeksu dla lepszej wydajności zapytań
CREATE INDEX idx_quiz_groups_group_id ON quiz_groups(group_id);
CREATE INDEX idx_quiz_groups_quiz_id ON quiz_groups(quiz_id); 