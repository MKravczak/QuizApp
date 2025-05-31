package com.example.quizservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
    @Builder.Default
    private Set<Long> groupIds = new HashSet<>();
    private Integer questionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 