import axios from 'axios';
import authHeader from './AuthHeader';
import API_BASE_URL from './api-config';

const API_URL = API_BASE_URL.statistics;

class StatisticsService {
    // Przesyłanie wyników quizu
    submitQuizResult(resultData) {
        return axios.post(`${API_URL}/results`, resultData, { headers: authHeader() });
    }

    // Pobieranie wyników dla konkretnego quizu (tylko własne wyniki użytkownika)
    getQuizResults(quizId) {
        return axios.get(`${API_URL}/quizzes/${quizId}/results`, { headers: authHeader() });
    }
    
    // Pobieranie wszystkich wyników dla konkretnego quizu
    getAllQuizResults(quizId) {
        return axios.get(`${API_URL}/quizzes/${quizId}/all-results`, { headers: authHeader() });
    }
    
    // Pobieranie wszystkich wyników użytkownika
    getUserResults() {
        return axios.get(`${API_URL}/users/results`, { headers: authHeader() });
    }

    // Sprawdzenie zdrowia serwisu
    healthCheck() {
        return axios.get(`${API_URL}/health`);
    }
}

// Tworzymy instancję i eksportujemy ją
const statisticsService = new StatisticsService();
export default statisticsService; 