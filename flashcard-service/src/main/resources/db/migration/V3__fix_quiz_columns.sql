-- Krok 1: Skopiowanie wartości z deck_id do flashcard_deck_id (dla pewności)
UPDATE flashcards.quizzes SET flashcard_deck_id = deck_id WHERE flashcard_deck_id IS NULL;

-- Krok 2: Usunięcie ograniczenia klucza obcego dla deck_id
ALTER TABLE flashcards.quizzes 
    DROP CONSTRAINT IF EXISTS fkn7731o83bfw4nct8ylkdc0rum;

-- Krok 3: Usunięcie kolumny deck_id
ALTER TABLE flashcards.quizzes 
    DROP COLUMN IF EXISTS deck_id;

-- Krok 4: Upewnienie się, że flashcard_deck_id ma ograniczenie NOT NULL i referencje
ALTER TABLE flashcards.quizzes 
    ALTER COLUMN flashcard_deck_id SET NOT NULL; 