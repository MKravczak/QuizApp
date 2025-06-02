package com.example.flashcardservice.controller;

import com.example.flashcardservice.dto.FlashcardDeckDTO;
import com.example.flashcardservice.service.FlashcardDeckService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;

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

    @PostMapping("/available")
    public ResponseEntity<List<FlashcardDeckDTO>> getAvailableDecksForUser(
            @RequestHeader("X-User-ID") Long userId,
            @RequestBody(required = false) Set<Long> groupIds) {
        List<FlashcardDeckDTO> decks = deckService.getAvailableDecksForUser(userId, groupIds);
        return ResponseEntity.ok(decks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardDeckDTO> getDeckById(@PathVariable Long id) {
        return ResponseEntity.ok(deckService.getDeckById(id));
    }

    @PostMapping("/{deckId}/with-groups")
    public ResponseEntity<FlashcardDeckDTO> getDeckByIdWithGroups(
            @PathVariable Long deckId,
            @RequestHeader("X-User-ID") Long userId,
            @RequestBody(required = false) Set<Long> groupIds) {
        FlashcardDeckDTO deck = deckService.getDeckByIdWithGroups(deckId, userId, groupIds);
        return ResponseEntity.ok(deck);
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

    @PatchMapping("/{deckId}/public")
    public ResponseEntity<FlashcardDeckDTO> updateDeckPublicStatus(
            @PathVariable Long deckId,
            @RequestParam boolean isPublic,
            @RequestHeader("X-User-ID") Long userId) {
        FlashcardDeckDTO updatedDeck = deckService.updateDeckPublicStatus(deckId, isPublic, userId);
        return ResponseEntity.ok(updatedDeck);
    }

    @PostMapping("/{deckId}/groups")
    public ResponseEntity<FlashcardDeckDTO> assignDeckToGroups(
            @PathVariable Long deckId,
            @RequestBody Set<Long> groupIds,
            @RequestHeader("X-User-ID") Long userId) {
        FlashcardDeckDTO updatedDeck = deckService.assignDeckToGroups(deckId, groupIds, userId);
        return ResponseEntity.ok(updatedDeck);
    }

    @DeleteMapping("/{deckId}/groups")
    public ResponseEntity<FlashcardDeckDTO> removeDeckFromGroups(
            @PathVariable Long deckId,
            @RequestBody Set<Long> groupIds,
            @RequestHeader("X-User-ID") Long userId) {
        FlashcardDeckDTO updatedDeck = deckService.removeDeckFromGroups(deckId, groupIds, userId);
        return ResponseEntity.ok(updatedDeck);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<FlashcardDeckDTO>> getDecksForGroup(
            @PathVariable Long groupId) {
        List<FlashcardDeckDTO> decks = deckService.getDecksForGroup(groupId);
        return ResponseEntity.ok(decks);
    }

    @PostMapping("/{deckId}/import/csv")
    public ResponseEntity<FlashcardDeckDTO> importFromCSV(
            @PathVariable Long deckId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-ID") Long userId) {
        try {
            FlashcardDeckDTO updatedDeck = deckService.importFlashcardsFromCSV(deckId, file, userId);
            return ResponseEntity.ok(updatedDeck);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{deckId}/import/txt")
    public ResponseEntity<FlashcardDeckDTO> importFromTxt(
            @PathVariable Long deckId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-User-ID") Long userId) {
        try {
            FlashcardDeckDTO updatedDeck = deckService.importFlashcardsFromTxt(deckId, file, userId);
            return ResponseEntity.ok(updatedDeck);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
} 