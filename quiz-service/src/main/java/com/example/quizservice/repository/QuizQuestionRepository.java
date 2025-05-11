package com.example.quizservice.repository;

import com.example.quizservice.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    
    // Znajdź wszystkie pytania dla danego quizu
    List<QuizQuestion> findByQuizId(Long quizId);
} 