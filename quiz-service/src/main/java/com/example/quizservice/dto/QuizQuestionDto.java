package com.example.quizservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDto {
    private String question;  // pytanie
    private List<String> answers;  // lista możliwych odpowiedzi
    private Integer correctAnswerIndex;  // indeks poprawnej odpowiedzi
} 