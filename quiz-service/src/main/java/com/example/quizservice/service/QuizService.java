package com.example.quizservice.service;

import com.example.quizservice.dto.*;
import com.example.quizservice.exception.ResourceNotFoundException;
import com.example.quizservice.model.Quiz;
import com.example.quizservice.model.QuizQuestion;
import com.example.quizservice.model.QuizResult;
import com.example.quizservice.repository.QuizQuestionRepository;
import com.example.quizservice.repository.QuizRepository;
import com.example.quizservice.repository.QuizResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private static final Logger logger = LoggerFactory.getLogger(QuizService.class);

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
        logger.info("Attempting to create quiz. Request isPublic: {}", request.isPublic());
        // Tworzymy quiz
        Quiz quiz = Quiz.builder()
                .name(request.getName())
                .description(request.getDescription())
                .userId(userId)
                .isPublic(request.isPublic())
                .questionCount(request.getQuestionCount())
                .build();
        logger.info("Quiz entity to be saved - isPublic: {}", quiz.isPublic());
        
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
    
    public List<QuizDto> getAvailableQuizzesForUser(Long userId, java.util.Set<Long> groupIds) {
        List<Quiz> quizzes;
        if (groupIds == null || groupIds.isEmpty()) {
            // Jeśli użytkownik nie należy do żadnych grup, użyj standardowej metody
            quizzes = quizRepository.findAvailableForUser(userId);
        } else {
            // Uwzględnij quizy z grup użytkownika
            quizzes = quizRepository.findAvailableForUserWithGroups(userId, groupIds);
        }
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

    public QuizDto getQuizByIdWithGroups(Long quizId, Long userId, java.util.Set<Long> groupIds) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Sprawdź dostęp: właściciel, publiczny lub przez grupy
        boolean hasAccess = quiz.getUserId().equals(userId) || 
                           quiz.isPublic() || 
                           (groupIds != null && !Collections.disjoint(quiz.getGroupIds(), groupIds));
        
        if (!hasAccess) {
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

        // Pobierz pytania i utwórz kopię listy, aby móc ją bezpiecznie modyfikować
        List<QuizQuestion> quizQuestions = new ArrayList<>(quiz.getQuestions());
        
        // Wymieszaj kolejność pytań
        Collections.shuffle(quizQuestions);
        
        // Dla każdego pytania wymieszaj również kolejność odpowiedzi
        return quizQuestions.stream()
                .map(this::mapToRandomizedQuizQuestionDto)
                .collect(Collectors.toList());
    }

    public List<QuizQuestionDto> getQuizQuestionsWithGroups(Long quizId, Long userId, java.util.Set<Long> groupIds) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Sprawdź dostęp: właściciel, publiczny lub przez grupy
        boolean hasAccess = quiz.getUserId().equals(userId) || 
                           quiz.isPublic() || 
                           (groupIds != null && !Collections.disjoint(quiz.getGroupIds(), groupIds));
        
        if (!hasAccess) {
            throw new IllegalArgumentException("Nie masz dostępu do tego quizu");
        }

        // Pobierz pytania i utwórz kopię listy, aby móc ją bezpiecznie modyfikować
        List<QuizQuestion> quizQuestions = new ArrayList<>(quiz.getQuestions());
        
        // Wymieszaj kolejność pytań
        Collections.shuffle(quizQuestions);
        
        // Dla każdego pytania wymieszaj również kolejność odpowiedzi
        return quizQuestions.stream()
                .map(this::mapToRandomizedQuizQuestionDto)
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
        
        // Jeśli quiz staje się publiczny, usuń go ze wszystkich grup
        // ponieważ publiczne quizy są dostępne dla wszystkich użytkowników
        if (isPublic && !quiz.getGroupIds().isEmpty()) {
            logger.info("Quiz {} zmienił status na publiczny. Usuwanie z {} grup: {}", 
                    quizId, quiz.getGroupIds().size(), quiz.getGroupIds());
            quiz.getGroupIds().clear();
        }
        
        // Jawnie ustawiamy updatedAt (choć @PreUpdate powinien to zrobić automatycznie)
        quiz.setUpdatedAt(java.time.LocalDateTime.now());
        
        Quiz updatedQuiz = quizRepository.save(quiz);
        
        return mapToQuizDto(updatedQuiz);
    }

    @Transactional
    public QuizDto updateQuiz(Long quizId, com.example.quizservice.dto.request.QuizUpdateRequest request, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Tylko właściciel może aktualizować quiz
        if (!quiz.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do aktualizacji tego quizu");
        }

        // Aktualizuj podstawowe informacje
        if (request.getName() != null) {
            quiz.setName(request.getName());
        }
        if (request.getDescription() != null) {
            quiz.setDescription(request.getDescription());
        }
        quiz.setPublic(request.isPublic());
        
        // Aktualizuj grupy
        if (request.getGroupIds() != null) {
            quiz.setGroupIds(new HashSet<>(request.getGroupIds()));
        }

        Quiz updatedQuiz = quizRepository.save(quiz);
        return mapToQuizDto(updatedQuiz);
    }

    @Transactional
    public QuizDto assignQuizToGroups(Long quizId, Set<Long> groupIds, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Tylko właściciel może przypisywać quiz do grup
        if (!quiz.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do zarządzania grupami tego quizu");
        }

        // Dodaj nowe grupy do istniejących
        quiz.getGroupIds().addAll(groupIds);
        Quiz updatedQuiz = quizRepository.save(quiz);
        
        return mapToQuizDto(updatedQuiz);
    }

    @Transactional
    public QuizDto removeQuizFromGroups(Long quizId, Set<Long> groupIds, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Tylko właściciel może usuwać quiz z grup
        if (!quiz.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do zarządzania grupami tego quizu");
        }

        // Usuń grupy z quizu
        quiz.getGroupIds().removeAll(groupIds);
        Quiz updatedQuiz = quizRepository.save(quiz);
        
        return mapToQuizDto(updatedQuiz);
    }

    public List<QuizDto> getQuizzesForGroup(Long groupId) {
        List<Quiz> quizzes = quizRepository.findByGroupIdsContaining(groupId);
        return quizzes.stream()
                .map(this::mapToQuizDto)
                .collect(Collectors.toList());
    }

    /**
     * Sprawdza czy użytkownik jest właścicielem quizu
     */
    public boolean isQuizOwner(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));
        
        return quiz.getUserId().equals(userId);
    }

    // Mapowanie encji do DTO
    private QuizDto mapToQuizDto(Quiz quiz) {
        return QuizDto.builder()
                .id(quiz.getId())
                .name(quiz.getName())
                .description(quiz.getDescription())
                .userId(quiz.getUserId())
                .isPublic(quiz.isPublic())
                .groupIds(quiz.getGroupIds())
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
    
    private QuizQuestionDto mapToRandomizedQuizQuestionDto(QuizQuestion question) {
        // Kopiujemy odpowiedzi, aby nie modyfikować oryginalnej listy
        List<String> originalAnswers = new ArrayList<>(question.getAnswers());
        // Zapamiętujemy poprawną odpowiedź
        String correctAnswer = originalAnswers.get(question.getCorrectAnswerIndex());
        
        // Tworzymy nową listę z wymieszanymi odpowiedziami
        List<String> shuffledAnswers = new ArrayList<>(originalAnswers);
        Collections.shuffle(shuffledAnswers);
        
        // Znajdujemy nowy indeks poprawnej odpowiedzi
        int newCorrectAnswerIndex = shuffledAnswers.indexOf(correctAnswer);
        
        // Zwracamy DTO z wymieszanymi odpowiedziami
        return QuizQuestionDto.builder()
                .question(question.getQuestion())
                .answers(shuffledAnswers)
                .correctAnswerIndex(newCorrectAnswerIndex)
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