package com.example.flashcardservice.service;

import com.example.flashcardservice.dto.*;
import com.example.flashcardservice.exception.ResourceNotFoundException;
import com.example.flashcardservice.model.Flashcard;
import com.example.flashcardservice.model.FlashcardDeck;
import com.example.flashcardservice.model.Quiz;
import com.example.flashcardservice.model.QuizResult;
import com.example.flashcardservice.repository.FlashcardDeckRepository;
import com.example.flashcardservice.repository.QuizRepository;
import com.example.flashcardservice.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;

    @Autowired
    public QuizService(
            QuizRepository quizRepository,
            QuizResultRepository quizResultRepository,
            FlashcardDeckRepository flashcardDeckRepository) {
        this.quizRepository = quizRepository;
        this.quizResultRepository = quizResultRepository;
        this.flashcardDeckRepository = flashcardDeckRepository;
    }

    @Transactional
    public QuizDto createQuiz(CreateQuizRequest request, Long userId) {
        System.out.println("Rozpoczynam tworzenie quizu: " + request);
        System.out.println("Dla użytkownika: " + userId);
        
        try {
            // Znajdujemy zestaw fiszek
            FlashcardDeck deck = flashcardDeckRepository.findById(request.getFlashcardDeckId())
                    .orElseThrow(() -> new ResourceNotFoundException("Zestaw fiszek o id " + request.getFlashcardDeckId() + " nie istnieje"));
            System.out.println("Znaleziono zestaw fiszek: " + deck.getId() + " - " + deck.getName());

            // Sprawdź, czy zestaw fiszek należy do użytkownika lub jest publiczny
            if (!deck.getUserId().equals(userId) && !deck.isPublic()) {
                throw new IllegalArgumentException("Nie masz dostępu do tego zestawu fiszek");
            }
            System.out.println("Weryfikacja dostępu do zestawu fiszek: OK");

            // Sprawdź, czy zestaw ma wystarczającą liczbę fiszek
            int flashcardsCount = deck.getFlashcards().size();
            System.out.println("Liczba fiszek w zestawie: " + flashcardsCount);
            if (flashcardsCount < request.getQuestionCount()) {
                throw new IllegalArgumentException("Zestaw fiszek ma tylko " + flashcardsCount + 
                        " fiszek, a wymagane jest " + request.getQuestionCount());
            }
            System.out.println("Weryfikacja liczby fiszek: OK");

            // Tworzymy quiz
            Quiz quiz = Quiz.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .userId(userId)
                    .isPublic(request.isPublic())
                    .questionCount(request.getQuestionCount())
                    .flashcardDeck(deck)
                    .build();
            System.out.println("Utworzono obiekt Quiz: " + quiz);

            // Zapisujemy quiz w bazie danych
            Quiz savedQuiz = quizRepository.save(quiz);
            System.out.println("Quiz zapisany w bazie danych, ID: " + savedQuiz.getId());
            
            // Zwracamy DTO
            QuizDto quizDto = mapToQuizDto(savedQuiz);
            System.out.println("Quiz utworzony pomyślnie: " + quizDto);
            return quizDto;
        } catch (Exception e) {
            System.err.println("Błąd podczas tworzenia quizu: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<QuizDto> getQuizzesForUser(Long userId) {
        List<Quiz> quizzes = quizRepository.findAvailableForUser(userId);
        return quizzes.stream()
                .map(this::mapToQuizDto)
                .collect(Collectors.toList());
    }

    public List<QuizDto> getQuizzesForDeck(Long deckId, Long userId) {
        List<Quiz> quizzes = quizRepository.findByFlashcardDeckIdAndAvailableForUser(deckId, userId);
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

    public List<QuizQuestionDto> generateQuizQuestions(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz o id " + quizId + " nie istnieje"));

        // Sprawdź, czy quiz należy do użytkownika lub jest publiczny
        if (!quiz.getUserId().equals(userId) && !quiz.isPublic()) {
            throw new IllegalArgumentException("Nie masz dostępu do tego quizu");
        }

        FlashcardDeck deck = quiz.getFlashcardDeck();
        List<Flashcard> flashcards = new ArrayList<>(deck.getFlashcards());
        
        // Sprawdź, czy mamy wystarczającą liczbę fiszek
        if (flashcards.size() < quiz.getQuestionCount()) {
            throw new IllegalArgumentException("Za mało fiszek w zestawie");
        }

        // Losowo wybierz fiszki
        Collections.shuffle(flashcards);
        List<Flashcard> selectedFlashcards = flashcards.subList(0, quiz.getQuestionCount());

        // Przygotuj wszystkie możliwe odpowiedzi (definicje)
        List<String> allDefinitions = flashcards.stream()
                .map(Flashcard::getDefinition)
                .collect(Collectors.toList());

        Random random = new Random();
        List<QuizQuestionDto> questions = new ArrayList<>();

        for (Flashcard flashcard : selectedFlashcards) {
            String correctAnswer = flashcard.getDefinition();
            
            // Wybierz 3 losowe błędne odpowiedzi
            List<String> wrongAnswers = allDefinitions.stream()
                    .filter(def -> !def.equals(correctAnswer))
                    .collect(Collectors.toList());
            Collections.shuffle(wrongAnswers);
            List<String> selectedWrongAnswers = wrongAnswers.subList(0, Math.min(3, wrongAnswers.size()));

            // Utwórz listę wszystkich odpowiedzi i wymieszaj
            List<String> answers = new ArrayList<>(selectedWrongAnswers);
            answers.add(correctAnswer);
            Collections.shuffle(answers);

            // Znajdź indeks poprawnej odpowiedzi
            int correctIndex = answers.indexOf(correctAnswer);

            QuizQuestionDto questionDto = QuizQuestionDto.builder()
                    .question(flashcard.getTerm())
                    .answers(answers)
                    .correctAnswerIndex(correctIndex)
                    .build();

            questions.add(questionDto);
        }

        return questions;
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

        QuizResult savedResult = quizResultRepository.save(result);
        
        return mapToQuizResultDto(savedResult);
    }

    public List<QuizResultDto> getQuizResults(Long quizId, Long userId) {
        List<QuizResult> results = quizResultRepository.findByUserIdAndQuizId(userId, quizId);
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
                .flashcardDeckId(quiz.getFlashcardDeck().getId())
                .flashcardDeckName(quiz.getFlashcardDeck().getName())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
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
                .build();
    }
} 