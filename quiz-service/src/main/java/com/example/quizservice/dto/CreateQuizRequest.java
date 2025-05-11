package com.example.quizservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    
    @NotBlank(message = "Nazwa quizu nie może być pusta")
    private String name;
    
    private String description;
    
    @NotNull(message = "Liczba pytań jest wymagana")
    @Min(value = 1, message = "Quiz musi zawierać co najmniej jedno pytanie")
    private Integer questionCount;
    
    private boolean isPublic;
    
    @NotNull(message = "Lista pytań jest wymagana")
    private List<QuizQuestionDto> questions;
} 