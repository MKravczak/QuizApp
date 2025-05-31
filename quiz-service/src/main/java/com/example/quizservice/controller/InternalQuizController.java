package com.example.quizservice.controller;

import com.example.quizservice.dto.QuizDto;
import com.example.quizservice.service.QuizService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

/**
 * Kontroler dla komunikacji wewnętrznej między serwisami.
 * Endpointy w tym kontrolerze są dostępne bez uwierzytelnienia JWT
 * i są przeznaczone wyłącznie do komunikacji między mikroserwisami.
 */
@RestController
@RequestMapping("/internal/api/quizzes")
public class InternalQuizController {

    private static final Logger logger = LoggerFactory.getLogger(InternalQuizController.class);
    
    private final QuizService quizService;

    @Autowired
    public InternalQuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    /**
     * Sprawdza dostęp do quizu dla komunikacji wewnętrznej.
     * Używane przez serwis statystyk do weryfikacji uprawnień.
     */
    @PostMapping("/{quizId}/check-access")
    public ResponseEntity<QuizDto> checkQuizAccess(
            @PathVariable Long quizId,
            @RequestHeader("X-User-ID") Long userId,
            @RequestBody(required = false) Set<Long> groupIds,
            @RequestHeader(value = "X-Internal-Service", required = false) String internalService) {
        
        logger.debug("Sprawdzanie dostępu do quizu przez serwis wewnętrzny: quizId={}, userId={}, groupIds={}, service={}", 
                quizId, userId, groupIds, internalService);
        
        try {
            // Sprawdź dostęp używając istniejącej logiki
            QuizDto quiz = quizService.getQuizByIdWithGroups(quizId, userId, groupIds);
            logger.debug("Dostęp do quizu {} przyznany dla użytkownika {}", quizId, userId);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            logger.debug("Brak dostępu do quizu {} dla użytkownika {}: {}", quizId, userId, e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }

    /**
     * Sprawdza czy użytkownik jest właścicielem quizu.
     * Używane przez serwis statystyk.
     */
    @GetMapping("/{quizId}/owner/{userId}")
    public ResponseEntity<Boolean> isQuizOwner(
            @PathVariable Long quizId,
            @PathVariable Long userId,
            @RequestHeader(value = "X-Internal-Service", required = false) String internalService) {
        
        logger.debug("Sprawdzanie właściciela quizu przez serwis wewnętrzny: quizId={}, userId={}, service={}", 
                quizId, userId, internalService);
        
        try {
            boolean isOwner = quizService.isQuizOwner(quizId, userId);
            logger.debug("Sprawdzenie właściciela quizu {}: userId={}, isOwner={}", quizId, userId, isOwner);
            return ResponseEntity.ok(isOwner);
        } catch (Exception e) {
            logger.error("Błąd podczas sprawdzania właściciela quizu: quizId={}, userId={}", quizId, userId, e);
            return ResponseEntity.ok(false);
        }
    }
} 