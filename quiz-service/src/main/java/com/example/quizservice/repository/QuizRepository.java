package com.example.quizservice.repository;

import com.example.quizservice.model.Quiz;
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
    
    // Znajdź quizy dla użytkownika lub publiczne
    @Query("SELECT q FROM Quiz q WHERE q.userId = :userId OR q.isPublic = true")
    List<Quiz> findAvailableForUser(@Param("userId") Long userId);
    
    // Znajdź quizy przypisane do konkretnej grupy
    @Query("SELECT q FROM Quiz q JOIN q.groupIds g WHERE g = :groupId")
    List<Quiz> findByGroupIdsContaining(@Param("groupId") Long groupId);
    
    // Znajdź quizy dostępne dla użytkownika uwzględniając jego grupy
    @Query("SELECT DISTINCT q FROM Quiz q WHERE q.userId = :userId OR q.isPublic = true OR EXISTS (SELECT 1 FROM q.groupIds g WHERE g IN :groupIds)")
    List<Quiz> findAvailableForUserWithGroups(@Param("userId") Long userId, @Param("groupIds") java.util.Set<Long> groupIds);
} 