import AuthService from './AuthService';
import API_BASE_URL from './api-config';

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
    const userId = AuthService.getCurrentUser().id;
    const response = await fetch(`${API_BASE_URL.decks}/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`,
        'X-User-ID': userId
      }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się pobrać talii fiszek');
    }
    
    return response.json();
  }

  async getPublicDecks() {
    const response = await fetch(`${API_BASE_URL.decks}/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się pobrać publicznych talii fiszek');
    }
    
    return response.json();
  }

  async getDeckById(deckId) {
    const userId = AuthService.getCurrentUser().id;
    const token = AuthService.getToken();
    
    try {
      const response = await fetch(`${API_BASE_URL.decks}/${deckId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-ID': userId
        }
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać talii fiszek');
      }
      
      const data = await response.json();
      return { data: data }; // Zwracamy w formacie zgodnym z axios
    } catch (error) {
      console.error('Błąd podczas pobierania zestawu fiszek:', error);
      throw error;
    }
  }

  async createDeck(deckData) {
    const userId = AuthService.getCurrentUser().id;
    const response = await fetch(`${API_BASE_URL.decks}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`,
        'X-User-ID': userId
      },
      body: JSON.stringify(deckData)
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się utworzyć talii fiszek');
    }
    
    return response.json();
  }

  async updateDeck(deckId, deckData) {
    const userId = AuthService.getCurrentUser().id;
    console.log('Aktualizuję talię ID:', deckId);
    console.log('Dane do wysłania:', JSON.stringify(deckData));
    
    const response = await fetch(`${API_BASE_URL.decks}/${deckId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`,
        'X-User-ID': userId
      },
      body: JSON.stringify(deckData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Błąd odpowiedzi:', errorText);
      throw new Error('Nie udało się zaktualizować talii fiszek');
    }
    
    const data = await response.json();
    console.log('Otrzymana odpowiedź:', JSON.stringify(data));
    return data;
  }

  async deleteDeck(deckId) {
    const userId = AuthService.getCurrentUser().id;
    const response = await fetch(`${API_BASE_URL.decks}/${deckId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`,
        'X-User-ID': userId
      }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się usunąć talii fiszek');
    }
    
    return true;
  }

  async getFlashcardsByDeckId(deckId) {
    const response = await fetch(`${API_BASE_URL.flashcards}/deck/${deckId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się pobrać fiszek');
    }
    
    return response.json();
  }

  async getFlashcardById(flashcardId) {
    const response = await fetch(`${API_BASE_URL.flashcards}/${flashcardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się pobrać fiszki');
    }
    
    return response.json();
  }

  async createFlashcard(flashcardData) {
    const response = await fetch(`${API_BASE_URL.flashcards}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify(flashcardData)
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się utworzyć fiszki');
    }
    
    return response.json();
  }

  async updateFlashcard(flashcardId, flashcardData) {
    const response = await fetch(`${API_BASE_URL.flashcards}/${flashcardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: JSON.stringify(flashcardData)
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się zaktualizować fiszki');
    }
    
    return response.json();
  }

  async deleteFlashcard(flashcardId) {
    const response = await fetch(`${API_BASE_URL.flashcards}/${flashcardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się usunąć fiszki');
    }
    
    return true;
  }

  async uploadImage(flashcardId, formData) {
    const response = await fetch(`${API_BASE_URL.flashcards}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Błąd uploadImage:', errorText);
      throw new Error('Nie udało się przesłać obrazu: ' + errorText);
    }
    
    // Serwer zwraca ścieżkę do zapisanego obrazu
    const imagePath = await response.text();
    console.log('Otrzymana ścieżka obrazu:', imagePath);
    
    // Aktualizuj fiszkę z ścieżką do obrazu
    const flashcardData = {
      imagePath: imagePath
    };
    
    await this.updateFlashcard(flashcardId, flashcardData);
    
    return imagePath;
  }

  async importFlashcardsFromCSV(deckId, file) {
    const userId = AuthService.getCurrentUser().id;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL.decks}/${deckId}/import/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`,
        'X-User-ID': userId
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Nie udało się zaimportować fiszek z pliku CSV');
    }
    
    return response.json();
  }

  async importFlashcardsFromTxt(deckId, file) {
    const userId = AuthService.getCurrentUser().id;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL.decks}/${deckId}/import/txt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`,
        'X-User-ID': userId
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Nie udało się zaimportować fiszek z pliku TXT');
    }
    
    return response.json();
  }

  // Dodaję alias funkcji getDeck, aby była zgodna z wywołaniem w QuizCreate.js
  async getDeck(deckId) {
    try {
      // Pobierz talię za pomocą fetch
      const deck = await this.getDeckById(deckId);
      return deck;
    } catch (error) {
      console.error('Błąd podczas pobierania talii fiszek:', error);
      throw error;
    }
  }
}

// Tworzymy instancję i eksportujemy ją zgodnie z rekomendacjami ESLint
const flashcardService = new FlashcardService();
export default flashcardService; 