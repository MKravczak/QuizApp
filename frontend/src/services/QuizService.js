import axios from 'axios';
import authHeader from './AuthHeader';
import API_BASE_URL from './api-config';

const API_URL = API_BASE_URL.quizzes;

class QuizService {
    // Pobieranie quizów dostępnych dla użytkownika
    getQuizzes() {
        return axios.get(API_URL, { headers: authHeader() });
    }

    // Pobieranie quizów dla konkretnego zestawu fiszek
    getQuizzesForDeck(deckId) {
        return axios.get(`${API_URL}/deck/${deckId}`, { headers: authHeader() });
    }

    // Pobieranie konkretnego quizu
    getQuiz(quizId) {
        return axios.get(`${API_URL}/${quizId}`, { headers: authHeader() });
    }

    // Tworzenie nowego quizu
    createQuiz(quizData) {
        console.log('Wysyłanie danych do API:', quizData);
        return axios.post(API_URL, quizData, { headers: authHeader() });
    }

    // Generowanie pytań do quizu
    generateQuizQuestions(quizId) {
        return axios.get(`${API_URL}/${quizId}/questions`, { headers: authHeader() });
    }

    // Przesyłanie wyników quizu
    submitQuizResult(resultData) {
        return axios.post(`${API_URL}/results`, resultData, { headers: authHeader() });
    }

    // Pobieranie wyników dla konkretnego quizu
    getQuizResults(quizId) {
        return axios.get(`${API_URL}/${quizId}/results`, { headers: authHeader() });
    }

    // Usuwanie quizu
    deleteQuiz(quizId) {
        return axios.delete(`${API_URL}/${quizId}`, { headers: authHeader() });
    }

    // Aktualizacja statusu publicznego quizu
    updateQuizPublicStatus(quizId, isPublic) {
        return axios.patch(`${API_URL}/${quizId}/public?isPublic=${isPublic}`, {}, { headers: authHeader() });
    }
}

// Tworzymy instancję i eksportujemy ją
const quizService = new QuizService();
export default quizService; 