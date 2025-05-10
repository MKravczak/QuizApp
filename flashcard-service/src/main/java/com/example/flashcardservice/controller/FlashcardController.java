package com.example.flashcardservice.controller;

import com.example.flashcardservice.dto.FlashcardDTO;
import com.example.flashcardservice.service.FlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardService flashcardService;

    @GetMapping("/deck/{deckId}")
    public ResponseEntity<List<FlashcardDTO>> getFlashcardsByDeckId(@PathVariable Long deckId) {
        return ResponseEntity.ok(flashcardService.getFlashcardsByDeckId(deckId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardDTO> getFlashcardById(@PathVariable Long id) {
        return ResponseEntity.ok(flashcardService.getFlashcardById(id));
    }

    @PostMapping
    public ResponseEntity<FlashcardDTO> createFlashcard(@Valid @RequestBody FlashcardDTO flashcardDTO) {
        return new ResponseEntity<>(flashcardService.createFlashcard(flashcardDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashcardDTO> updateFlashcard(
            @PathVariable Long id, 
            @Valid @RequestBody FlashcardDTO flashcardDTO) {
        return ResponseEntity.ok(flashcardService.updateFlashcard(id, flashcardDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable Long id) {
        flashcardService.deleteFlashcard(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imagePath = flashcardService.uploadImage(file);
            return ResponseEntity.ok(imagePath);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Nie udało się zapisać pliku: " + e.getMessage());
        }
    }
} 