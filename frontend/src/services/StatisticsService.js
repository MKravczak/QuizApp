import { statisticsAPI } from './api';

class StatisticsService {
    // Przesyłanie wyników quizu
    submitQuizResult(resultData) {
        return statisticsAPI.submitResult(resultData);
    }

    // Pobieranie wyników dla konkretnego quizu (tylko własne wyniki użytkownika)
    getQuizResults(quizId) {
        return statisticsAPI.getQuizResults(quizId);
    }
    
    // Pobieranie wszystkich wyników dla konkretnego quizu
    getAllQuizResults(quizId) {
        return statisticsAPI.getAllQuizResults(quizId);
    }
    
    // Pobieranie wszystkich wyników użytkownika
    getUserResults() {
        return statisticsAPI.getUserResults();
    }

    // Sprawdzenie zdrowia serwisu
    healthCheck() {
        return statisticsAPI.healthCheck();
    }
}

// Tworzymy instancję i eksportujemy ją
const statisticsService = new StatisticsService();
export default statisticsService; 