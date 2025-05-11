package com.example.flashcardservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDto {
    private Long id;
    private String name;
    private String description;
    private Long userId;
    private boolean isPublic;
    private Integer questionCount;
    private Long flashcardDeckId;
    private String flashcardDeckName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 