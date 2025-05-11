package com.example.flashcardservice.dto;

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
    private String question;  // term z fiszki (front)
    private List<String> answers;  // lista 4 możliwych odpowiedzi
    private Integer correctAnswerIndex;  // indeks poprawnej odpowiedzi
} 