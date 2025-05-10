package com.example.flashcardservice.repository;

import com.example.flashcardservice.model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {
    
    List<FlashcardDeck> findByUserId(Long userId);
    
    List<FlashcardDeck> findByIsPublicTrue();
} 