package com.example.quizservice.service;

import com.example.quizservice.dto.*;
import com.example.quizservice.exception.ResourceNotFoundException;
import com.example.quizservice.model.Quiz;
import com.example.quizservice.model.QuizQuestion;
import com.example.quizservice.model.QuizResult;
import com.example.quizservice.repository.QuizQuestionRepository;
import com.example.quizservice.repository.QuizRepository;
import com.example.quizservice.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository questionRepository;
    private final QuizResultRepository resultRepository;

    @Autowired
    public QuizService(
            QuizRepository quizRepository,
            QuizQuestionRepository questionRepository,
            QuizResultRepository resultRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.resultRepository = resultRepository;
    }

    @Transactional
    public QuizDto createQuiz(CreateQuizRequest request, Long userId) {
        // Tworzymy quiz
        Quiz quiz = Quiz.builder()
                .name(request.getName())
                .description(request.getDescription())
                .userId(userId)
                .isPublic(request.isPublic())
                .questionCount(request.getQuestionCount())
                .build();
        
        // Zapisujemy quiz w bazie danych
        Quiz savedQuiz = quizRepository.save(quiz);
        
        // Dodajemy pytania do quizu
        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            for (QuizQuestionDto questionDto : request.getQuestions()) {
                QuizQuestion question = QuizQuestion.builder()
                        .quiz(savedQuiz)
                        .question(questionDto.getQuestion())
                        .answers(questionDto.getAnswers())
                        .correctAnswerIndex(questionDto.getCorrectAnswerIndex())
                        .build();
                
                questionRepository.save(question);
                savedQuiz.addQuestion(question);
            }
        }
        
        // Zwracamy DTO
        return mapToQuizDto(savedQuiz);
    }

    public List<QuizDto> getQuizzesForUser(Long userId) {
        List<Quiz> quizzes = quizRepository.findAvailableForUser(userId);
        return quizzes.stream()
                .map(this::mapToQuizDto)
                .collect(Collectors.toList());
    }
    
    public List<QuizDto> getQuizzesCreatedByUser(Long userId) {
        List<Quiz> quizzes = quizRepository.findByUserId(userId);
        return quizzes.stream()
                .map(this::mapToQuizDto)
                .collect(Collectors.toList());
    }

    public QuizDto getQuizById(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Sprawdź, czy quiz należy do użytkownika lub jest publiczny
        if (!quiz.getUserId().equals(userId) && !quiz.isPublic()) {
            throw new IllegalArgumentException("Nie masz dostępu do tego quizu");
        }

        return mapToQuizDto(quiz);
    }

    public List<QuizQuestionDto> getQuizQuestions(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Sprawdź, czy quiz należy do użytkownika lub jest publiczny
        if (!quiz.getUserId().equals(userId) && !quiz.isPublic()) {
            throw new IllegalArgumentException("Nie masz dostępu do tego quizu");
        }

        return quiz.getQuestions().stream()
                .map(this::mapToQuizQuestionDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuizResultDto submitQuizResult(SubmitQuizResultRequest request, Long userId) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + request.getQuizId() + " nie istnieje"));

        QuizResult result = QuizResult.builder()
                .quiz(quiz)
                .userId(userId)
                .score(request.getScore())
                .totalQuestions(request.getTotalQuestions())
                .durationInSeconds(request.getDurationInSeconds())
                .completedAt(LocalDateTime.now())
                .build();

        QuizResult savedResult = resultRepository.save(result);
        quiz.addResult(savedResult);
        
        return mapToQuizResultDto(savedResult);
    }

    public List<QuizResultDto> getQuizResults(Long quizId, Long userId) {
        // Sprawdź, czy quiz istnieje
        quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));
        
        List<QuizResult> results = resultRepository.findByUserIdAndQuizId(userId, quizId);
        return results.stream()
                .map(this::mapToQuizResultDto)
                .collect(Collectors.toList());
    }
    
    public List<QuizResultDto> getAllQuizResults(Long quizId, Long userId) {
        // Pobierz quiz
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));
        
        // Tylko właściciel quizu może zobaczyć wszystkie wyniki
        if (!quiz.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do przeglądania wszystkich wyników tego quizu");
        }
        
        // Pobierz wszystkie wyniki dla danego quizu
        List<QuizResult> results = resultRepository.findByQuizId(quizId);
        return results.stream()
                .map(this::mapToQuizResultDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteQuiz(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Tylko właściciel może usunąć quiz
        if (!quiz.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do usunięcia tego quizu");
        }

        quizRepository.delete(quiz);
    }

    @Transactional
    public QuizDto updateQuizPublicStatus(Long quizId, boolean isPublic, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Tylko właściciel może aktualizować quiz
        if (!quiz.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do aktualizacji tego quizu");
        }

        quiz.setPublic(isPublic);
        Quiz updatedQuiz = quizRepository.save(quiz);
        
        return mapToQuizDto(updatedQuiz);
    }

    // Mapowanie encji do DTO
    private QuizDto mapToQuizDto(Quiz quiz) {
        return QuizDto.builder()
                .id(quiz.getId())
                .name(quiz.getName())
                .description(quiz.getDescription())
                .userId(quiz.getUserId())
                .isPublic(quiz.isPublic())
                .questionCount(quiz.getQuestionCount())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }

    private QuizQuestionDto mapToQuizQuestionDto(QuizQuestion question) {
        return QuizQuestionDto.builder()
                .question(question.getQuestion())
                .answers(question.getAnswers())
                .correctAnswerIndex(question.getCorrectAnswerIndex())
                .build();
    }

    private QuizResultDto mapToQuizResultDto(QuizResult result) {
        return QuizResultDto.builder()
                .id(result.getId())
                .quizId(result.getQuiz().getId())
                .quizName(result.getQuiz().getName())
                .userId(result.getUserId())
                .score(result.getScore())
                .totalQuestions(result.getTotalQuestions())
                .durationInSeconds(result.getDurationInSeconds())
                .completedAt(result.getCompletedAt())
                .createdAt(result.getCreatedAt())
                .build();
    }
} 