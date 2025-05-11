package com.example.quizservice.repository;

import com.example.quizservice.model.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    
    // Znajdź wszystkie wyniki dla danego quizu
    List<QuizResult> findByQuizId(Long quizId);
    
    // Znajdź wszystkie wyniki danego użytkownika
    List<QuizResult> findByUserId(Long userId);
    
    // Znajdź wszystkie wyniki danego użytkownika dla konkretnego quizu
    List<QuizResult> findByUserIdAndQuizId(Long userId, Long quizId);
} 