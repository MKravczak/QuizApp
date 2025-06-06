package com.example.flashcardservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardDeckDTO {
    
    private Long id;
    
    @NotBlank(message = "Nazwa zestawu nie może być pusta")
    private String name;
    
    private String description;
    
    @JsonProperty("isPublic")
    private boolean isPublic;
    
    @Builder.Default
    private Set<Long> groupIds = new HashSet<>();
    
    @Builder.Default
    private List<FlashcardDTO> flashcards = new ArrayList<>();
} 