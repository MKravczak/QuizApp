import axios from 'axios';
import securityService from './securityService';

// Tworzenie instancji axios z konfiguracją
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor - dodaje nagłówki bezpieczeństwa do każdego żądania
API.interceptors.request.use(
    (config) => {
        console.log('🔒 Adding security headers to request:', config.url);
        
        // Dodaj nagłówki bezpieczeństwa
        config = securityService.enhanceRequestConfig(config);
        
        // Dodaj token autoryzacji jeśli istnieje
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Dodaj User ID jeśli istnieje
        const userId = localStorage.getItem('userId');
        if (userId) {
            config.headers['X-User-ID'] = userId;
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - obsługa błędów
API.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Response error:', error);
        
        // Jeśli błąd 403 z powodu zabezpieczeń, pokaż ostrzeżenie
        if (error.response?.status === 403) {
            const errorData = error.response.data;
            if (errorData?.error === 'Access denied') {
                console.warn('🚫 Request blocked by security filter:', errorData.reason);
                // Możesz tutaj dodać toast notification lub inne powiadomienie
            }
        }
        
        // Jeśli błąd 401, przekieruj na logowanie
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

// Eksportuj instancję API
export default API;

// Eksportuj również gotowe funkcje dla różnych serwisów
export const userAPI = {
    baseURL: 'http://localhost:8080',
    login: (credentials) => API.post('/api/auth/login', credentials),
    register: (userData) => API.post('/api/auth/register', userData),
    getCurrentUser: () => API.get('/api/users/me'),
    updateUser: (userData) => API.put('/api/users/me', userData),
    getUsernamesByIds: (userIds) => API.post('/api/users/usernames', userIds),
};

export const quizAPI = {
    baseURL: 'http://localhost:8083',
    getQuizzes: () => API.get('http://localhost:8083/api/quizzes'),
    getMyQuizzes: () => API.get('http://localhost:8083/api/quizzes/my'),
    createQuiz: (quizData) => API.post('http://localhost:8083/api/quizzes', quizData),
    getQuizById: (id) => API.get(`http://localhost:8083/api/quizzes/${id}`),
    getQuizQuestions: (id) => API.get(`http://localhost:8083/api/quizzes/${id}/questions`),
    deleteQuiz: (id) => API.delete(`http://localhost:8083/api/quizzes/${id}`),
    submitResult: (resultData) => API.post('http://localhost:8083/api/quizzes/results', resultData),
};

export const flashcardAPI = {
    baseURL: 'http://localhost:8081',
    getMyDecks: () => API.get('http://localhost:8081/api/decks/my'),
    getPublicDecks: () => API.get('http://localhost:8081/api/decks/public'),
    createDeck: (deckData) => API.post('http://localhost:8081/api/decks', deckData),
    getDeckById: (id) => API.get(`http://localhost:8081/api/decks/${id}`),
    updateDeck: (id, deckData) => API.put(`http://localhost:8081/api/decks/${id}`, deckData),
    deleteDeck: (id) => API.delete(`http://localhost:8081/api/decks/${id}`),
    
    // Flashcards methods
    getFlashcardsByDeckId: (deckId) => API.get(`http://localhost:8081/api/flashcards/deck/${deckId}`),
    getFlashcardById: (id) => API.get(`http://localhost:8081/api/flashcards/${id}`),
    createFlashcard: (flashcardData) => API.post('http://localhost:8081/api/flashcards', flashcardData),
    updateFlashcard: (id, flashcardData) => API.put(`http://localhost:8081/api/flashcards/${id}`, flashcardData),
    deleteFlashcard: (id) => API.delete(`http://localhost:8081/api/flashcards/${id}`),
    uploadImage: (flashcardId, formData) => API.post(`http://localhost:8081/api/flashcards/${flashcardId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    importFromCSV: (deckId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return API.post(`http://localhost:8081/api/decks/${deckId}/import/csv`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    importFromTxt: (deckId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return API.post(`http://localhost:8081/api/decks/${deckId}/import/txt`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}; 