package com.example.flashcardservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDTO {
    
    private Long id;
    
    @NotBlank(message = "Hasło nie może być puste")
    private String term;
    
    @NotBlank(message = "Definicja nie może być pusta")
    private String definition;
    
    private String imagePath;
    
    private Long deckId;
} 