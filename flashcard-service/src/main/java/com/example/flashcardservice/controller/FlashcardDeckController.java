package com.example.flashcardservice.controller;

import com.example.flashcardservice.dto.FlashcardDeckDTO;
import com.example.flashcardservice.service.FlashcardDeckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class FlashcardDeckController {

    private final FlashcardDeckService deckService;

    @GetMapping("/my")
    public ResponseEntity<List<FlashcardDeckDTO>> getMyDecks(@RequestHeader("X-User-ID") Long userId) {
        return ResponseEntity.ok(deckService.getAllDecksByUserId(userId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<FlashcardDeckDTO>> getPublicDecks() {
        return ResponseEntity.ok(deckService.getPublicDecks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardDeckDTO> getDeckById(@PathVariable Long id) {
        return ResponseEntity.ok(deckService.getDeckById(id));
    }

    @PostMapping
    public ResponseEntity<FlashcardDeckDTO> createDeck(
            @Valid @RequestBody FlashcardDeckDTO deckDTO,
            @RequestHeader("X-User-ID") Long userId) {
        return new ResponseEntity<>(deckService.createDeck(deckDTO, userId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashcardDeckDTO> updateDeck(
            @PathVariable Long id,
            @Valid @RequestBody FlashcardDeckDTO deckDTO,
            @RequestHeader("X-User-ID") Long userId) {
        return ResponseEntity.ok(deckService.updateDeck(id, deckDTO, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeck(
            @PathVariable Long id,
            @RequestHeader("X-User-ID") Long userId) {
        deckService.deleteDeck(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/import/csv")
    public ResponseEntity<?> importFromCSV(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-ID") Long userId) {
        try {
            FlashcardDeckDTO updatedDeck = deckService.importFlashcardsFromCSV(id, file, userId);
            return ResponseEntity.ok(updatedDeck);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Nie udało się przetworzyć pliku CSV: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/import/txt")
    public ResponseEntity<?> importFromTxt(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-ID") Long userId) {
        try {
            FlashcardDeckDTO updatedDeck = deckService.importFlashcardsFromTxt(id, file, userId);
            return ResponseEntity.ok(updatedDeck);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Nie udało się przetworzyć pliku TXT: " + e.getMessage());
        }
    }
} 