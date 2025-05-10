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
        System.out.println("Aktualizacja zestawu ID=" + id + ", isPublic=" + deckDTO.isPublic());
        
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + id + " nie został znaleziony"));

        // Sprawdź, czy użytkownik jest właścicielem zestawu
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalStateException("Nie masz uprawnień do edycji tego zestawu");
        }

        System.out.println("Przed aktualizacją, isPublic=" + deck.isPublic());
        
        deck.setName(deckDTO.getName());
        deck.setDescription(deckDTO.getDescription());
        deck.setPublic(deckDTO.isPublic());
        
        System.out.println("Po aktualizacji, przed zapisem, isPublic=" + deck.isPublic());

        FlashcardDeck updatedDeck = deckRepository.save(deck);
        System.out.println("Po zapisie, isPublic=" + updatedDeck.isPublic());
        
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

        int successCount = 0;
        int recordCount = 0;
        
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

            for (CSVRecord csvRecord : csvParser) {
                recordCount++;
                try {
                    String term = csvRecord.get("term");
                    String definition = csvRecord.get("definition");
                    
                    if (term != null && !term.isEmpty() && definition != null && !definition.isEmpty()) {
                        FlashcardDTO flashcardDTO = FlashcardDTO.builder()
                                .term(term)
                                .definition(definition)
                                .deckId(deckId)
                                .build();
                        
                        flashcardService.createFlashcard(flashcardDTO);
                        successCount++;
                    } else {
                        System.out.println("Ostrzeżenie: Rekord " + recordCount + " zawiera pusty termin lub definicję i został pominięty");
                    }
                } catch (Exception e) {
                    System.out.println("Błąd podczas przetwarzania rekordu " + recordCount + ": " + e.getMessage());
                }
            }
        }
        
        System.out.println("Import zakończony: Przetworzono " + recordCount + " rekordów, zaimportowano " + successCount + " fiszek");
        
        if (successCount == 0) {
            throw new IllegalArgumentException("Nie udało się zaimportować żadnej fiszki. Sprawdź format pliku CSV (nagłówki: term,definition).");
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

        int successCount = 0;
        int lineCount = 0;
        
        try (BufferedReader fileReader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = fileReader.readLine()) != null) {
                lineCount++;
                if (line.trim().isEmpty()) {
                    continue; // Pomijamy puste linie
                }
                
                try {
                    String[] parts = line.split("::", 2);
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
                            successCount++;
                        } else {
                            System.out.println("Ostrzeżenie: Linia " + lineCount + " zawiera pusty termin lub definicję i została pominięta");
                        }
                    } else {
                        System.out.println("Ostrzeżenie: Linia " + lineCount + " nie zawiera poprawnego separatora '::' i została pominięta");
                    }
                } catch (Exception e) {
                    System.out.println("Błąd podczas przetwarzania linii " + lineCount + ": " + e.getMessage());
                }
            }
        }
        
        System.out.println("Import zakończony: Przetworzono " + lineCount + " linii, zaimportowano " + successCount + " fiszek");
        
        if (successCount == 0) {
            throw new IllegalArgumentException("Nie udało się zaimportować żadnej fiszki. Sprawdź format pliku (term::definition).");
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