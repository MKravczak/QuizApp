package com.example.statisticsservice.repository;

import com.example.statisticsservice.model.QuizStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizStatisticsRepository extends JpaRepository<QuizStatistics, Long> {
    
   
    List<QuizStatistics> findByQuizId(Long quizId);
    
    List<QuizStatistics> findByUserId(Long userId);
    
    List<QuizStatistics> findByUserIdAndQuizId(Long userId, Long quizId);
} 