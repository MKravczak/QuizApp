package com.example.quizservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDto {
    private Long id;
    private Long quizId;
    private String quizName;
    private Long userId;
    private Integer score;
    private Integer totalQuestions;
    private Long durationInSeconds;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
} 