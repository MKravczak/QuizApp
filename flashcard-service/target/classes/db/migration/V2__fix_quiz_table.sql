-- Usunięcie kolumny flashcard_deck_id z tabeli quizzes (jeśli istnieje)
ALTER TABLE IF EXISTS flashcards.quizzes 
    DROP COLUMN IF EXISTS flashcard_deck_id;

-- Upewnienie się, że deck_id ma constraint NOT NULL
ALTER TABLE IF EXISTS flashcards.quizzes 
    ALTER COLUMN deck_id SET NOT NULL; 