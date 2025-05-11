package com.example.flashcardservice.repository;

import com.example.flashcardservice.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    // Znajdź wszystkie quizy należące do użytkownika
    List<Quiz> findByUserId(Long userId);
    
    // Znajdź wszystkie publiczne quizy
    List<Quiz> findByIsPublicTrue();
    
    // Znajdź wszystkie quizy dla danego zestawu fiszek
    List<Quiz> findByFlashcardDeckId(Long deckId);
    
    // Znajdź quizy dla użytkownika lub publiczne
    @Query("SELECT q FROM Quiz q WHERE q.userId = :userId OR q.isPublic = true")
    List<Quiz> findAvailableForUser(@Param("userId") Long userId);
    
    // Znajdź quizy dla danego zestawu fiszek i dla użytkownika lub publiczne
    @Query("SELECT q FROM Quiz q WHERE q.flashcardDeck.id = :deckId AND (q.userId = :userId OR q.isPublic = true)")
    List<Quiz> findByFlashcardDeckIdAndAvailableForUser(@Param("deckId") Long deckId, @Param("userId") Long userId);
} 