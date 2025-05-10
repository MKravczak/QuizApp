package com.example.flashcardservice.service;

import com.example.flashcardservice.dto.FlashcardDTO;
import com.example.flashcardservice.exception.ResourceNotFoundException;
import com.example.flashcardservice.model.Flashcard;
import com.example.flashcardservice.model.FlashcardDeck;
import com.example.flashcardservice.repository.FlashcardDeckRepository;
import com.example.flashcardservice.repository.FlashcardRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final FlashcardDeckRepository deckRepository;
    private final String uploadDir;

    // Konstruktor z wstrzyknięciem katalogu na podstawie właściwości
    public FlashcardService(
            FlashcardRepository flashcardRepository,
            FlashcardDeckRepository deckRepository,
            @Value("${app.file.upload-dir}") String uploadDir) {
        this.flashcardRepository = flashcardRepository;
        this.deckRepository = deckRepository;
        this.uploadDir = uploadDir;
        createUploadDirectoryIfNeeded();
    }

    private void createUploadDirectoryIfNeeded() {
        try {
            Path dirPath = Paths.get(uploadDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Nie można utworzyć katalogu do przechowywania plików", e);
        }
    }

    public List<FlashcardDTO> getFlashcardsByDeckId(Long deckId) {
        return flashcardRepository.findByDeckId(deckId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public FlashcardDTO getFlashcardById(Long id) {
        return flashcardRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Fiszka o id " + id + " nie została znaleziona"));
    }

    @Transactional
    public FlashcardDTO createFlashcard(FlashcardDTO flashcardDTO) {
        FlashcardDeck deck = deckRepository.findById(flashcardDTO.getDeckId())
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + flashcardDTO.getDeckId() + " nie został znaleziony"));

        Flashcard flashcard = mapToEntity(flashcardDTO);
        flashcard.setDeck(deck);
        
        Flashcard savedFlashcard = flashcardRepository.save(flashcard);
        return mapToDTO(savedFlashcard);
    }

    @Transactional
    public FlashcardDTO updateFlashcard(Long id, FlashcardDTO flashcardDTO) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fiszka o id " + id + " nie została znaleziona"));

        flashcard.setTerm(flashcardDTO.getTerm());
        flashcard.setDefinition(flashcardDTO.getDefinition());
        
        if (flashcardDTO.getImagePath() != null && !flashcardDTO.getImagePath().equals(flashcard.getImagePath())) {
            // Usuń stare zdjęcie jeśli istnieje
            if (flashcard.getImagePath() != null) {
                deleteImage(flashcard.getImagePath());
            }
            flashcard.setImagePath(flashcardDTO.getImagePath());
        }

        Flashcard updatedFlashcard = flashcardRepository.save(flashcard);
        return mapToDTO(updatedFlashcard);
    }

    @Transactional
    public void deleteFlashcard(Long id) {
        Flashcard flashcard = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fiszka o id " + id + " nie została znaleziona"));

        // Usuń zdjęcie jeśli istnieje
        if (flashcard.getImagePath() != null) {
            deleteImage(flashcard.getImagePath());
        }

        flashcardRepository.delete(flashcard);
    }

    @Transactional
    public String uploadImage(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path targetLocation = Paths.get(uploadDir).resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        return fileName;
    }
    
    private void deleteImage(String imagePath) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(imagePath);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Logowanie błędu, ale nie przerywanie operacji
            System.err.println("Nie można usunąć pliku: " + imagePath);
        }
    }

    private FlashcardDTO mapToDTO(Flashcard flashcard) {
        return FlashcardDTO.builder()
                .id(flashcard.getId())
                .term(flashcard.getTerm())
                .definition(flashcard.getDefinition())
                .imagePath(flashcard.getImagePath())
                .deckId(flashcard.getDeck().getId())
                .build();
    }

    private Flashcard mapToEntity(FlashcardDTO flashcardDTO) {
        return Flashcard.builder()
                .id(flashcardDTO.getId())
                .term(flashcardDTO.getTerm())
                .definition(flashcardDTO.getDefinition())
                .imagePath(flashcardDTO.getImagePath())
                .build();
    }
} 