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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FlashcardDeckService {

    private static final Logger logger = LoggerFactory.getLogger(FlashcardDeckService.class);

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

    public List<FlashcardDeckDTO> getAvailableDecksForUser(Long userId, Set<Long> groupIds) {
        List<FlashcardDeck> decks;
        if (groupIds == null || groupIds.isEmpty()) {
            // Jeśli użytkownik nie należy do żadnych grup, użyj standardowej metody
            decks = deckRepository.findAvailableForUser(userId);
        } else {
            // Uwzględnij talie z grup użytkownika
            decks = deckRepository.findAvailableForUserWithGroups(userId, groupIds);
        }
        return decks.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public FlashcardDeckDTO getDeckById(Long id) {
        return deckRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + id + " nie został znaleziony"));
    }

    public FlashcardDeckDTO getDeckByIdWithGroups(Long deckId, Long userId, Set<Long> groupIds) {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Talia o id " + deckId + " nie istnieje"));

        // Sprawdź dostęp: właściciel, publiczny lub przez grupy
        boolean hasAccess = deck.getUserId().equals(userId) || 
                           deck.isPublic() || 
                           (groupIds != null && !java.util.Collections.disjoint(deck.getGroupIds(), groupIds));
        
        if (!hasAccess) {
            throw new IllegalArgumentException("Nie masz dostępu do tej talii");
        }

        return mapToDTO(deck);
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
        FlashcardDeck existingDeck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + id + " nie został znaleziony"));
        
        // Sprawdź, czy użytkownik jest właścicielem
        if (!existingDeck.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do edytowania tego zestawu");
        }
        
        existingDeck.setName(deckDTO.getName());
        existingDeck.setDescription(deckDTO.getDescription());
        existingDeck.setPublic(deckDTO.isPublic());
        
        // Jeśli talia staje się publiczna, usuń ją ze wszystkich grup
        if (deckDTO.isPublic() && !existingDeck.getGroupIds().isEmpty()) {
            logger.info("Talia {} zmienił status na publiczny. Usuwanie z {} grup: {}", 
                    id, existingDeck.getGroupIds().size(), existingDeck.getGroupIds());
            existingDeck.getGroupIds().clear();
        }
        
        FlashcardDeck savedDeck = deckRepository.save(existingDeck);
        return mapToDTO(savedDeck);
    }

    @Transactional
    public void deleteDeck(Long id, Long userId) {
        FlashcardDeck deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zestaw o id " + id + " nie został znaleziony"));
        
        // Sprawdź, czy użytkownik jest właścicielem
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do usunięcia tego zestawu");
        }
        
        deckRepository.delete(deck);
    }

    @Transactional
    public FlashcardDeckDTO updateDeckPublicStatus(Long deckId, boolean isPublic, Long userId) {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Talia o id " + deckId + " nie istnieje"));

        // Tylko właściciel może aktualizować talię
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do aktualizacji tej talii");
        }

        deck.setPublic(isPublic);
        
        // Jeśli talia staje się publiczna, usuń ją ze wszystkich grup
        // ponieważ publiczne talie są dostępne dla wszystkich użytkowników
        if (isPublic && !deck.getGroupIds().isEmpty()) {
            logger.info("Talia {} zmienił status na publiczny. Usuwanie z {} grup: {}", 
                    deckId, deck.getGroupIds().size(), deck.getGroupIds());
            deck.getGroupIds().clear();
        }
        
        FlashcardDeck updatedDeck = deckRepository.save(deck);
        
        return mapToDTO(updatedDeck);
    }

    @Transactional
    public FlashcardDeckDTO assignDeckToGroups(Long deckId, Set<Long> groupIds, Long userId) {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Talia o id " + deckId + " nie istnieje"));

        // Tylko właściciel może przypisywać talię do grup
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do zarządzania grupami tej talii");
        }

        // Nie można przypisywać publicznych talii do grup
        if (deck.isPublic()) {
            throw new IllegalArgumentException("Nie można przypisywać publicznych talii do grup");
        }

        // Dodaj nowe grupy do istniejących
        deck.getGroupIds().addAll(groupIds);
        FlashcardDeck updatedDeck = deckRepository.save(deck);
        
        return mapToDTO(updatedDeck);
    }

    @Transactional
    public FlashcardDeckDTO removeDeckFromGroups(Long deckId, Set<Long> groupIds, Long userId) {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Talia o id " + deckId + " nie istnieje"));

        // Tylko właściciel może usuwać talię z grup
        if (!deck.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Nie masz uprawnień do zarządzania grupami tej talii");
        }

        // Usuń grupy z talii
        deck.getGroupIds().removeAll(groupIds);
        FlashcardDeck updatedDeck = deckRepository.save(deck);
        
        return mapToDTO(updatedDeck);
    }

    public List<FlashcardDeckDTO> getDecksForGroup(Long groupId) {
        List<FlashcardDeck> decks = deckRepository.findByGroupIdsContaining(groupId);
        return decks.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Sprawdza czy użytkownik jest właścicielem talii
     */
    public boolean isDeckOwner(Long deckId, Long userId) {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new ResourceNotFoundException("Talia o id " + deckId + " nie istnieje"));
        
        return deck.getUserId().equals(userId);
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
             CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {

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
                    continue; 
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
                .groupIds(deck.getGroupIds())
                .flashcards(flashcardDTOs)
                .build();
    }

    private FlashcardDeck mapToEntity(FlashcardDeckDTO deckDTO) {
        FlashcardDeck deck = FlashcardDeck.builder()
                .id(deckDTO.getId())
                .name(deckDTO.getName())
                .description(deckDTO.getDescription())
                .isPublic(deckDTO.isPublic())
                .groupIds(deckDTO.getGroupIds() != null ? new HashSet<>(deckDTO.getGroupIds()) : new HashSet<>())
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