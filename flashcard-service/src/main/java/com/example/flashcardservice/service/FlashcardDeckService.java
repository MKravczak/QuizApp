package com.example.flashcardservice.service;

import com.example.flashcardservice.dto.FlashcardDTO;
import com.example.flashcardservice.dto.FlashcardDeckDTO;
import com.example.flashcardservice.exception.ResourceNotFoundException;
import com.example.flashcardservice.model.Flashcard;
import com.example.flashcardservice.model.FlashcardDeck;
import com.example.flashcardservice.repository.FlashcardDeckRepository;
import jakarta.transaction.Transactional;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlashcardDeckService {

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardService flashcardService;

    public FlashcardDeckService(FlashcardDeckRepository deckRepository, FlashcardService flashcardService) {
        this.deckRepository = deckRepository;
        this.flashcardService = flashcardService;
    }

    public List<FlashcardDeckDTO> getAllDecksByUserId(Long userId) {
        return deckRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<FlashcardDeckDTO> getPublicDecks() {
        return deckRepository.findByIsPublicTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public FlashcardDeckDTO getDeckById(Long id) {
        return deckRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + id + " nie został znaleziony"));
    }

    @Transactional
    public FlashcardDeckDTO createDeck(FlashcardDeckDTO deckDTO, Long userId) {
        FlashcardDeck deck = mapToEntity(deckDTO);
        deck.setUserId(userId);
        
        FlashcardDeck savedDeck = deckRepository.save(deck);
        return mapToDTO(savedDeck);
    }

    @Transactional
    public FlashcardDeckDTO updateDeck(Long id, FlashcardDeckDTO deckDTO, Long userId) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + id + " nie został znaleziony"));

        // Sprawdź, czy użytkownik jest właścicielem zestawu
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalStateException("Nie masz uprawnień do edycji tego zestawu");
        }

        deck.setName(deckDTO.getName());
        deck.setDescription(deckDTO.getDescription());
        deck.setPublic(deckDTO.isPublic());

        FlashcardDeck updatedDeck = deckRepository.save(deck);
        return mapToDTO(updatedDeck);
    }

    @Transactional
    public void deleteDeck(Long id, Long userId) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + id + " nie został znaleziony"));

        // Sprawdź, czy użytkownik jest właścicielem zestawu
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalStateException("Nie masz uprawnień do usunięcia tego zestawu");
        }

        // Fiszki zostaną usunięte automatycznie dzięki CascadeType.ALL
        deckRepository.delete(deck);
    }

    @Transactional
    public FlashcardDeckDTO importFlashcardsFromCSV(Long deckId, MultipartFile file, Long userId) throws IOException {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + deckId + " nie został znaleziony"));

        // Sprawdź, czy użytkownik jest właścicielem zestawu
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalStateException("Nie masz uprawnień do modyfikacji tego zestawu");
        }

        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord csvRecord : csvParser) {
                String term = csvRecord.get("term");
                String definition = csvRecord.get("definition");
                
                if (term != null && !term.isEmpty() && definition != null && !definition.isEmpty()) {
                    FlashcardDTO flashcardDTO = FlashcardDTO.builder()
                            .term(term)
                            .definition(definition)
                            .deckId(deckId)
                            .build();
                    
                    flashcardService.createFlashcard(flashcardDTO);
                }
            }
        }

        return getDeckById(deckId);
    }

    @Transactional
    public FlashcardDeckDTO importFlashcardsFromTxt(Long deckId, MultipartFile file, Long userId) throws IOException {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + deckId + " nie został znaleziony"));

        // Sprawdź, czy użytkownik jest właścicielem zestawu
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalStateException("Nie masz uprawnień do modyfikacji tego zestawu");
        }

        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = fileReader.readLine()) != null) {
                String[] parts = line.split("-", 2);
                if (parts.length == 2) {
                    String term = parts[0].trim();
                    String definition = parts[1].trim();
                    
                    if (!term.isEmpty() && !definition.isEmpty()) {
                        FlashcardDTO flashcardDTO = FlashcardDTO.builder()
                                .term(term)
                                .definition(definition)
                                .deckId(deckId)
                                .build();
                        
                        flashcardService.createFlashcard(flashcardDTO);
                    }
                }
            }
        }

        return getDeckById(deckId);
    }

    private FlashcardDeckDTO mapToDTO(FlashcardDeck deck) {
        List<FlashcardDTO> flashcardDTOs = deck.getFlashcards().stream()
                .map(flashcard -> FlashcardDTO.builder()
                        .id(flashcard.getId())
                        .term(flashcard.getTerm())
                        .definition(flashcard.getDefinition())
                        .imagePath(flashcard.getImagePath())
                        .deckId(deck.getId())
                        .build())
                .collect(Collectors.toList());

        return FlashcardDeckDTO.builder()
                .id(deck.getId())
                .name(deck.getName())
                .description(deck.getDescription())
                .isPublic(deck.isPublic())
                .flashcards(flashcardDTOs)
                .build();
    }

    private FlashcardDeck mapToEntity(FlashcardDeckDTO deckDTO) {
        FlashcardDeck deck = FlashcardDeck.builder()
                .id(deckDTO.getId())
                .name(deckDTO.getName())
                .description(deckDTO.getDescription())
                .isPublic(deckDTO.isPublic())
                .flashcards(new ArrayList<>())
                .build();

        if (deckDTO.getFlashcards() != null) {
            List<Flashcard> flashcards = deckDTO.getFlashcards().stream()
                    .map(flashcardDTO -> {
                        Flashcard flashcard = Flashcard.builder()
                                .id(flashcardDTO.getId())
                                .term(flashcardDTO.getTerm())
                                .definition(flashcardDTO.getDefinition())
                                .imagePath(flashcardDTO.getImagePath())
                                .build();
                        flashcard.setDeck(deck);
                        return flashcard;
                    })
                    .collect(Collectors.toList());
            
            deck.getFlashcards().addAll(flashcards);
        }

        return deck;
    }
} 