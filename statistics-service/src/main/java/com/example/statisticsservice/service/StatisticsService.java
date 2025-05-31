package com.example.statisticsservice.service;

import com.example.statisticsservice.client.QuizServiceClient;
import com.example.statisticsservice.client.UserServiceClient;
import com.example.statisticsservice.dto.QuizStatisticsDto;
import com.example.statisticsservice.dto.SubmitQuizResultRequest;
import com.example.statisticsservice.model.QuizStatistics;
import com.example.statisticsservice.repository.QuizStatisticsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);
    private final QuizStatisticsRepository statisticsRepository;
    private final QuizServiceClient quizServiceClient;
    private final UserServiceClient userServiceClient;

    @Autowired
    public StatisticsService(QuizStatisticsRepository statisticsRepository, 
                           QuizServiceClient quizServiceClient,
                           UserServiceClient userServiceClient) {
        this.statisticsRepository = statisticsRepository;
        this.quizServiceClient = quizServiceClient;
        this.userServiceClient = userServiceClient;
    }

    @Transactional
    public QuizStatisticsDto submitQuizResult(SubmitQuizResultRequest request, Long userId) {
        logger.debug("Przetwarzanie żądania zapisania wyniku: quizId={}, score={}, userId={}", 
                request.getQuizId(), request.getScore(), userId);
        
        QuizStatistics statistics = QuizStatistics.builder()
                .quizId(request.getQuizId())
                .userId(userId)
                .score(request.getScore())
                .totalQuestions(request.getTotalQuestions())
                .durationInSeconds(request.getDurationInSeconds())
                .completedAt(LocalDateTime.now())
                .build();
        
        logger.debug("Utworzono obiekt statystyk: {}", statistics);
        QuizStatistics savedStatistics = statisticsRepository.save(statistics);
        logger.info("Zapisano statystyki w bazie danych: id={}, quizId={}, score={}", 
                savedStatistics.getId(), savedStatistics.getQuizId(), savedStatistics.getScore());
        
        return mapToQuizStatisticsDto(savedStatistics, request.getQuizName());
    }

    public List<QuizStatisticsDto> getQuizResults(Long quizId, Long userId) {
        logger.debug("Pobieranie wyników dla quizu {} i użytkownika {}", quizId, userId);
        List<QuizStatistics> results = statisticsRepository.findByUserIdAndQuizId(userId, quizId);
        logger.debug("Znaleziono {} wyników", results.size());
        
        return results.stream()
                .map(result -> mapToQuizStatisticsDto(result, null))
                .collect(Collectors.toList());
    }
    
    public List<QuizStatisticsDto> getAllQuizResults(Long quizId, Long userId) {
        logger.debug("Pobieranie wszystkich wyników dla quizu {} przez użytkownika {}", quizId, userId);
        
        // Sprawdź czy użytkownik jest administratorem
        boolean isAdmin = userServiceClient.isUserAdmin(userId);
        if (isAdmin) {
            logger.debug("Użytkownik {} jest administratorem - zwracam wszystkie wyniki quizu {}", userId, quizId);
            List<QuizStatistics> results = statisticsRepository.findByQuizId(quizId);
            logger.debug("Znaleziono {} wyników", results.size());
            
            return results.stream()
                    .map(result -> mapToQuizStatisticsDto(result, null))
                    .collect(Collectors.toList());
        }
        
        // Sprawdź czy użytkownik jest właścicielem quizu
        boolean isOwner = quizServiceClient.isQuizOwner(quizId, userId);
        
        if (!isOwner) {
            // Jeśli nie jest właścicielem, sprawdź czy ma dostęp przez grupy
            Set<Long> userGroupIds = userServiceClient.getUserGroupIds(userId);
            boolean hasAccess = quizServiceClient.hasAccessToQuiz(quizId, userId, userGroupIds);
            
            if (!hasAccess) {
                logger.warn("Użytkownik {} nie ma uprawnień do przeglądania wszystkich wyników quizu {}", userId, quizId);
                throw new SecurityException("Nie masz uprawnień do przeglądania wszystkich wyników tego quizu");
            }
            
            // Jeśli ma dostęp przez grupy, ale nie jest właścicielem, zwróć tylko swoje wyniki
            logger.debug("Użytkownik {} ma dostęp do quizu {} przez grupy, ale nie jest właścicielem - zwracam tylko jego wyniki", userId, quizId);
            return getQuizResults(quizId, userId);
        }
        
        // Jeśli jest właścicielem, zwróć wszystkie wyniki
        logger.debug("Użytkownik {} jest właścicielem quizu {} - zwracam wszystkie wyniki", userId, quizId);
        List<QuizStatistics> results = statisticsRepository.findByQuizId(quizId);
        logger.debug("Znaleziono {} wyników", results.size());
        
        return results.stream()
                .map(result -> mapToQuizStatisticsDto(result, null))
                .collect(Collectors.toList());
    }
    
    // Metoda bez sprawdzania uprawnień - tylko dla wewnętrznego użytku
    public List<QuizStatisticsDto> getAllQuizResults(Long quizId) {
        logger.debug("Pobieranie wszystkich wyników dla quizu {} (bez sprawdzania uprawnień)", quizId);
        List<QuizStatistics> results = statisticsRepository.findByQuizId(quizId);
        logger.debug("Znaleziono {} wyników", results.size());
        
        return results.stream()
                .map(result -> mapToQuizStatisticsDto(result, null))
                .collect(Collectors.toList());
    }
    
    public List<QuizStatisticsDto> getUserResults(Long userId) {
        logger.debug("Pobieranie wyników dla użytkownika {}", userId);
        List<QuizStatistics> results = statisticsRepository.findByUserId(userId);
        logger.debug("Znaleziono {} wyników", results.size());
        
        return results.stream()
                .map(result -> mapToQuizStatisticsDto(result, null))
                .collect(Collectors.toList());
    }
    
    private QuizStatisticsDto mapToQuizStatisticsDto(QuizStatistics statistics, String quizName) {
        QuizStatisticsDto dto = QuizStatisticsDto.builder()
                .id(statistics.getId())
                .quizId(statistics.getQuizId())
                .quizName(quizName)
                .userId(statistics.getUserId())
                .score(statistics.getScore())
                .totalQuestions(statistics.getTotalQuestions())
                .durationInSeconds(statistics.getDurationInSeconds())
                .completedAt(statistics.getCompletedAt())
                .createdAt(statistics.getCreatedAt())
                .build();
        
        logger.debug("Zmapowano statystyki do DTO: {}", dto);
        return dto;
    }
} 