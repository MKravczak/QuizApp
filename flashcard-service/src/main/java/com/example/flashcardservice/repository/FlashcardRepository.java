package com.example.flashcardservice.repository;

import com.example.flashcardservice.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    
    List<Flashcard> findByDeckId(Long deckId);
} 