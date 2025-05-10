package com.example.flashcardservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDeckDTO {
    
    private Long id;
    
    @NotBlank(message = "Nazwa zestawu nie może być pusta")
    private String name;
    
    private String description;
    
    private boolean isPublic;
    
    @Builder.Default
    private List<FlashcardDTO> flashcards = new ArrayList<>();
} 