package com.example.statisticsservice.controller;

import com.example.statisticsservice.dto.QuizStatisticsDto;
import com.example.statisticsservice.dto.SubmitQuizResultRequest;
import com.example.statisticsservice.service.StatisticsService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsController.class);
    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @PostMapping("/results")
    public ResponseEntity<QuizStatisticsDto> submitQuizResult(
            @Valid @RequestBody SubmitQuizResultRequest request,
            @RequestHeader("X-User-ID") Long userId) {
        logger.info("Otrzymano wynik quizu: quizId={}, quizName={}, score={}, totalQuestions={}, userId={}", 
                request.getQuizId(), request.getQuizName(), request.getScore(), request.getTotalQuestions(), userId);
        QuizStatisticsDto result = statisticsService.submitQuizResult(request, userId);
        logger.info("Zapisano wynik quizu: id={}, score={}", result.getId(), result.getScore());
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/quizzes/{quizId}/results")
    public ResponseEntity<List<QuizStatisticsDto>> getQuizResults(
            @PathVariable Long quizId,
            @RequestHeader("X-User-ID") Long userId) {
        logger.info("Pobieranie wyników dla quizu: quizId={}, userId={}", quizId, userId);
        List<QuizStatisticsDto> results = statisticsService.getQuizResults(quizId, userId);
        logger.info("Znaleziono {} wyników", results.size());
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/quizzes/{quizId}/all-results")
    public ResponseEntity<List<QuizStatisticsDto>> getAllQuizResults(
            @PathVariable Long quizId,
            @RequestHeader(value = "X-User-ID", required = false) Long userId) {
        logger.info("Pobieranie wszystkich wyników dla quizu: quizId={}", quizId);
        List<QuizStatisticsDto> results = statisticsService.getAllQuizResults(quizId);
        logger.info("Znaleziono {} wyników", results.size());
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/users/results")
    public ResponseEntity<List<QuizStatisticsDto>> getUserResults(
            @RequestHeader("X-User-ID") Long userId) {
        logger.info("Pobieranie wyników użytkownika: userId={}", userId);
        List<QuizStatisticsDto> results = statisticsService.getUserResults(userId);
        logger.info("Znaleziono {} wyników dla użytkownika", results.size());
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "statistics-service"));
    }
} 