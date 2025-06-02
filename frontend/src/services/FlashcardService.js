import AuthService from './AuthService';
import { flashcardAPI } from './api';

class FlashcardService {
  async getDecks() {
    try {
      console.log('🚀 FlashcardService.getDecks() - rozpoczęcie ładowania talii z grupami');
      
      // Pobierz grupy użytkownika
      const GroupService = (await import('./GroupService')).default;
      const myGroupsResponse = await GroupService.getMyGroups();
      
      console.log('📊 myGroupsResponse:', myGroupsResponse);
      const groupIds = myGroupsResponse.data.map(group => group.id);
      console.log('🔗 groupIds:', groupIds);
      
      // Pobierz talie z uwzględnieniem grup
      const response = await this.getAvailableDecks(groupIds);
      console.log('📦 getAvailableDecks response:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Błąd podczas pobierania zestawów fiszek:', error);
      throw error;
    }
  }

  // Pobieranie talii dostępnych dla użytkownika z uwzględnieniem grup
  getAvailableDecks(groupIds) {
    return flashcardAPI.getAvailableDecks(groupIds);
  }

  async getMyDecks() {
    try {
      return await flashcardAPI.getMyDecks();
    } catch (error) {
      console.error('Błąd podczas pobierania moich talii:', error);
      throw error;
    }
  }

  async getPublicDecks() {
    try {
      return await flashcardAPI.getPublicDecks();
    } catch (error) {
      console.error('Błąd podczas pobierania publicznych talii:', error);
      throw error;
    }
  }

  // Pobieranie konkretnej talii z uwzględnieniem grup
  async getDeckWithGroups(deckId) {
    try {
      const GroupService = (await import('./GroupService')).default;
      const myGroupsResponse = await GroupService.getMyGroups();
      const groupIds = myGroupsResponse.data.map(group => group.id);
      return flashcardAPI.getDeckByIdWithGroups(deckId, groupIds);
    } catch (error) {
      console.error('Błąd podczas pobierania talii z grupami:', error);
      throw error;
    }
  }

  async getDeckById(id) {
    try {
      const response = await flashcardAPI.getDeckById(id);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania zestawu fiszek:', error);
      throw error;
    }
  }

  async createDeck(deckData) {
    try {
      return await flashcardAPI.createDeck(deckData);
    } catch (error) {
      console.error('Błąd podczas tworzenia zestawu fiszek:', error);
      throw error;
    }
  }

  async updateDeck(id, deckData) {
    try {
      return await flashcardAPI.updateDeck(id, deckData);
    } catch (error) {
      console.error('Błąd podczas aktualizacji zestawu fiszek:', error);
      throw error;
    }
  }

  async deleteDeck(id) {
    try {
      return await flashcardAPI.deleteDeck(id);
    } catch (error) {
      console.error('Błąd podczas usuwania zestawu fiszek:', error);
      throw error;
    }
  }

  // Aktualizacja statusu publicznego talii
  async updateDeckPublicStatus(deckId, isPublic) {
    try {
      console.log('🔧 FlashcardService.updateDeckPublicStatus:', { deckId, isPublic });
      const response = await flashcardAPI.updateDeckPublicStatus(deckId, isPublic);
      console.log('✅ Odpowiedź z flashcardAPI:', response);
      return response;
    } catch (error) {
      console.error('❌ Błąd w FlashcardService.updateDeckPublicStatus:', error);
      throw error;
    }
  }

  // Przypisanie talii do grup
  assignDeckToGroups(deckId, groupIds) {
    return flashcardAPI.assignDeckToGroups(deckId, groupIds);
  }

  // Usunięcie talii z grup
  removeDeckFromGroups(deckId, groupIds) {
    return flashcardAPI.removeDeckFromGroups(deckId, groupIds);
  }

  // Pobieranie talii dla konkretnej grupy
  getDecksForGroup(groupId) {
    return flashcardAPI.getDecksForGroup(groupId);
  }

  // Flashcard methods
  async getFlashcardsByDeckId(deckId) {
    try {
      const response = await flashcardAPI.getFlashcardsByDeckId(deckId);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania fiszek:', error);
      throw error;
    }
  }

  async getFlashcardById(id) {
    try {
      const response = await flashcardAPI.getFlashcardById(id);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania fiszki:', error);
      throw error;
    }
  }

  async createFlashcard(flashcardData) {
    try {
      return await flashcardAPI.createFlashcard(flashcardData);
    } catch (error) {
      console.error('Błąd podczas tworzenia fiszki:', error);
      throw error;
    }
  }

  async updateFlashcard(id, flashcardData) {
    try {
      return await flashcardAPI.updateFlashcard(id, flashcardData);
    } catch (error) {
      console.error('Błąd podczas aktualizacji fiszki:', error);
      throw error;
    }
  }

  async deleteFlashcard(id) {
    try {
      return await flashcardAPI.deleteFlashcard(id);
    } catch (error) {
      console.error('Błąd podczas usuwania fiszki:', error);
      throw error;
    }
  }

  async uploadImage(flashcardId, file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      return await flashcardAPI.uploadImage(flashcardId, formData);
    } catch (error) {
      console.error('Błąd podczas przesyłania obrazu:', error);
      throw error;
    }
  }

  async importFlashcardsFromCSV(deckId, file) {
    try {
      return await flashcardAPI.importFromCSV(deckId, file);
    } catch (error) {
      console.error('Błąd podczas importu z CSV:', error);
      throw error;
    }
  }

  async importFlashcardsFromTxt(deckId, file) {
    try {
      return await flashcardAPI.importFromTxt(deckId, file);
    } catch (error) {
      console.error('Błąd podczas importu z TXT:', error);
      throw error;
    }
  }
}

export default new FlashcardService(); 