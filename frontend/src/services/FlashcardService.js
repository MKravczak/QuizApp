import AuthService from './AuthService';
import API_BASE_URL from './api-config';

class FlashcardService {
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
    const response = await fetch(`${API_BASE_URL.decks}/${deckId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AuthService.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Nie udało się pobrać talii fiszek');
    }
    
    return response.json();
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
      throw new Error('Nie udało się zaktualizować talii fiszek');
    }
    
    return response.json();
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
      throw new Error('Nie udało się zaimportować fiszek z pliku CSV');
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
      throw new Error('Nie udało się zaimportować fiszek z pliku TXT');
    }
    
    return response.json();
  }
}

export default new FlashcardService(); 