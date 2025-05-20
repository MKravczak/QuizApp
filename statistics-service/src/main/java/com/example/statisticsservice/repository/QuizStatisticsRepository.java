package com.example.statisticsservice.repository;

import com.example.statisticsservice.model.QuizStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizStatisticsRepository extends JpaRepository<QuizStatistics, Long> {
    
    // Znajdź wszystkie wyniki dla danego quizu
    List<QuizStatistics> findByQuizId(Long quizId);
    
    // Znajdź wszystkie wyniki danego użytkownika
    List<QuizStatistics> findByUserId(Long userId);
    
    // Znajdź wszystkie wyniki danego użytkownika dla konkretnego quizu
    List<QuizStatistics> findByUserIdAndQuizId(Long userId, Long quizId);
} 