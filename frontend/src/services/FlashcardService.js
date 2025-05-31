import AuthService from './AuthService';
import { flashcardAPI } from './api';

class FlashcardService {
  async getDecks() {
    try {
      // Pobierz prywatne talie użytkownika
      const myDecksPromise = this.getMyDecks();
      
      // Pobierz publiczne talie
      const publicDecksPromise = this.getPublicDecks();
      
      // Zaczekaj na oba żądania
      const [myDecks, publicDecks] = await Promise.all([myDecksPromise, publicDecksPromise]);
      
      // Znajdź publiczne talie, które nie należą do użytkownika
      const otherPublicDecks = publicDecks.filter(publicDeck => 
        !myDecks.some(myDeck => myDeck.id === publicDeck.id)
      );
      
      // Połącz listy talii
      const allDecks = [...myDecks, ...otherPublicDecks];
      
      // Zwróć w formacie zgodnym z axios
      return {
        data: allDecks
      };
    } catch (error) {
      console.error('Błąd podczas pobierania zestawów fiszek:', error);
      throw error;
    }
  }

  async getMyDecks() {
    try {
      const response = await flashcardAPI.getMyDecks();
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania talii fiszek:', error);
      throw new Error('Nie udało się pobrać talii fiszek');
    }
  }

  async getPublicDecks() {
    try {
      const response = await flashcardAPI.getPublicDecks();
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania publicznych talii fiszek:', error);
      throw new Error('Nie udało się pobrać publicznych talii fiszek');
    }
  }

  async getDeckById(deckId) {
    try {
      const response = await flashcardAPI.getDeckById(deckId);
      return { data: response.data }; // Zwracamy w formacie zgodnym z axios
    } catch (error) {
      console.error('Błąd podczas pobierania zestawu fiszek:', error);
      throw error;
    }
  }

  async createDeck(deckData) {
    try {
      const response = await flashcardAPI.createDeck(deckData);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas tworzenia talii:', error);
      throw new Error('Nie udało się utworzyć talii fiszek');
    }
  }

  async updateDeck(deckId, deckData) {
    console.log('Aktualizuję talię ID:', deckId);
    console.log('Dane do wysłania:', JSON.stringify(deckData));
    
    try {
      const response = await flashcardAPI.updateDeck(deckId, deckData);
      console.log('Otrzymana odpowiedź:', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Błąd podczas aktualizacji talii:', error);
      throw new Error('Nie udało się zaktualizować talii fiszek');
    }
  }

  async deleteDeck(deckId) {
    try {
      await flashcardAPI.deleteDeck(deckId);
      return true;
    } catch (error) {
      console.error('Błąd podczas usuwania talii:', error);
      throw new Error('Nie udało się usunąć talii fiszek');
    }
  }

  async getFlashcardsByDeckId(deckId) {
    try {
      const response = await flashcardAPI.getFlashcardsByDeckId(deckId);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania fiszek:', error);
      throw new Error('Nie udało się pobrać fiszek');
    }
  }

  async getFlashcardById(flashcardId) {
    try {
      const response = await flashcardAPI.getFlashcardById(flashcardId);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania fiszki:', error);
      throw new Error('Nie udało się pobrać fiszki');
    }
  }

  async createFlashcard(flashcardData) {
    try {
      const response = await flashcardAPI.createFlashcard(flashcardData);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas tworzenia fiszki:', error);
      throw new Error('Nie udało się utworzyć fiszki');
    }
  }

  async updateFlashcard(flashcardId, flashcardData) {
    try {
      const response = await flashcardAPI.updateFlashcard(flashcardId, flashcardData);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas aktualizacji fiszki:', error);
      throw new Error('Nie udało się zaktualizować fiszki');
    }
  }

  async deleteFlashcard(flashcardId) {
    try {
      await flashcardAPI.deleteFlashcard(flashcardId);
      return true;
    } catch (error) {
      console.error('Błąd podczas usuwania fiszki:', error);
      throw new Error('Nie udało się usunąć fiszki');
    }
  }

  async uploadImage(flashcardId, formData) {
    try {
      const response = await flashcardAPI.uploadImage(flashcardId, formData);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas przesyłania obrazu:', error);
      throw new Error('Nie udało się przesłać obrazu');
    }
  }

  async importFlashcardsFromCSV(deckId, file) {
    try {
      const response = await flashcardAPI.importFromCSV(deckId, file);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas importu z CSV:', error);
      throw new Error('Nie udało się zaimportować fiszek z pliku CSV');
    }
  }

  async importFlashcardsFromTxt(deckId, file) {
    try {
      const response = await flashcardAPI.importFromTxt(deckId, file);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas importu z TXT:', error);
      throw new Error('Nie udało się zaimportować fiszek z pliku TXT');
    }
  }

  async getDeck(deckId) {
    // Alias dla getDeckById dla kompatybilności
    return this.getDeckById(deckId);
  }
}

// Tworzymy instancję i eksportujemy ją zgodnie z rekomendacjami ESLint
const flashcardService = new FlashcardService();
export default flashcardService; 