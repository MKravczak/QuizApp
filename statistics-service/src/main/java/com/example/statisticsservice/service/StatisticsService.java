package com.example.statisticsservice.service;

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
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsService.class);
    private final QuizStatisticsRepository statisticsRepository;

    @Autowired
    public StatisticsService(QuizStatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
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
    
    public List<QuizStatisticsDto> getAllQuizResults(Long quizId) {
        logger.debug("Pobieranie wszystkich wyników dla quizu {}", quizId);
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