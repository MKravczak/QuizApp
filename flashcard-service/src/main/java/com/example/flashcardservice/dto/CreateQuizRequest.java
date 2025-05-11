package com.example.flashcardservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    @NotBlank(message = "Nazwa quizu nie może być pusta")
    private String name;
    
    private String description;
    
    @NotNull(message = "ID zestawu fiszek jest wymagane")
    private Long flashcardDeckId;
    
    @NotNull(message = "Liczba pytań jest wymagana")
    @Min(value = 1, message = "Liczba pytań musi być większa niż 0")
    private Integer questionCount;
    
    private boolean isPublic;
} 