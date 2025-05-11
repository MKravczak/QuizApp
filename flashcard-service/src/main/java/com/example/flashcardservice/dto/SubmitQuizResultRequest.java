package com.example.flashcardservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizResultRequest {
    @NotNull(message = "ID quizu jest wymagane")
    private Long quizId;
    
    @NotNull(message = "Wynik jest wymagany")
    @Min(value = 0, message = "Wynik nie może być ujemny")
    private Integer score;
    
    @NotNull(message = "Liczba pytań jest wymagana")
    @Min(value = 1, message = "Liczba pytań musi być większa niż 0")
    private Integer totalQuestions;
    
    @NotNull(message = "Czas trwania jest wymagany")
    @Min(value = 1, message = "Czas trwania musi być większy niż 0")
    private Long durationInSeconds;
} 