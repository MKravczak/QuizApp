package com.example.flashcardservice.repository;

import com.example.flashcardservice.model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {
    
    List<FlashcardDeck> findByUserId(Long userId);
    
    List<FlashcardDeck> findByIsPublicTrue();
    
    // Znajdź talie dostępne dla użytkownika (należące do niego lub publiczne)
    @Query("SELECT d FROM FlashcardDeck d WHERE d.userId = :userId OR d.isPublic = true")
    List<FlashcardDeck> findAvailableForUser(@Param("userId") Long userId);
    
    // Znajdź talie przypisane do konkretnej grupy
    @Query("SELECT d FROM FlashcardDeck d JOIN d.groupIds g WHERE g = :groupId")
    List<FlashcardDeck> findByGroupIdsContaining(@Param("groupId") Long groupId);
    
    // Znajdź talie dostępne dla użytkownika uwzględniając jego grupy
    @Query("SELECT DISTINCT d FROM FlashcardDeck d WHERE d.userId = :userId OR d.isPublic = true OR EXISTS (SELECT 1 FROM d.groupIds g WHERE g IN :groupIds)")
    List<FlashcardDeck> findAvailableForUserWithGroups(@Param("userId") Long userId, @Param("groupIds") java.util.Set<Long> groupIds);
} 