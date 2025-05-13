package com.example.quizservice.controller;

import com.example.quizservice.dto.*;
import com.example.quizservice.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            @RequestHeader("X-User-ID") Long userId) {
        try {
            QuizDto quiz = quizService.createQuiz(request, userId);
            return new ResponseEntity<>(quiz, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Błąd przy tworzeniu quizu: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<QuizDto>> getQuizzesForUser(
            @RequestHeader("X-User-ID") Long userId) {
        List<QuizDto> quizzes = quizService.getQuizzesForUser(userId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/my")
    public ResponseEntity<List<QuizDto>> getMyQuizzes(
            @RequestHeader("X-User-ID") Long userId) {
        List<QuizDto> quizzes = quizService.getQuizzesCreatedByUser(userId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizDto> getQuizById(
            @PathVariable Long quizId,
            @RequestHeader("X-User-ID") Long userId) {
        QuizDto quiz = quizService.getQuizById(quizId, userId);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuizQuestionDto>> getQuizQuestions(
            @PathVariable Long quizId,
            @RequestHeader("X-User-ID") Long userId) {
        List<QuizQuestionDto> questions = quizService.getQuizQuestions(quizId, userId);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/results")
    public ResponseEntity<QuizResultDto> submitQuizResult(
            @Valid @RequestBody SubmitQuizResultRequest request,
            @RequestHeader("X-User-ID") Long userId) {
        QuizResultDto result = quizService.submitQuizResult(request, userId);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/{quizId}/results")
    public ResponseEntity<List<QuizResultDto>> getQuizResults(
            @PathVariable Long quizId,
            @RequestHeader("X-User-ID") Long userId) {
        List<QuizResultDto> results = quizService.getQuizResults(quizId, userId);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/{quizId}/all-results")
    public ResponseEntity<List<QuizResultDto>> getAllQuizResults(
            @PathVariable Long quizId,
            @RequestHeader("X-User-ID") Long userId) {
        List<QuizResultDto> results = quizService.getAllQuizResults(quizId, userId);
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable Long quizId,
            @RequestHeader("X-User-ID") Long userId) {
        quizService.deleteQuiz(quizId, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{quizId}/public")
    public ResponseEntity<QuizDto> updateQuizPublicStatus(
            @PathVariable Long quizId,
            @RequestParam boolean isPublic,
            @RequestHeader("X-User-ID") Long userId) {
        QuizDto updatedQuiz = quizService.updateQuizPublicStatus(quizId, isPublic, userId);
        return ResponseEntity.ok(updatedQuiz);
    }

    // Klasa dla zwracania błędów
    private static class ErrorResponse {
        private final String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        @SuppressWarnings("unused") // Used by Jackson for JSON serialization
        public String getMessage() {
            return message;
        }
    }
} 