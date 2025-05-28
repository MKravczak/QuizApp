import { quizAPI } from './api';

class QuizService {
    // Pobieranie quizów dostępnych dla użytkownika
    getQuizzes() {
        return quizAPI.getQuizzes();
    }

    // Pobieranie quizów utworzonych przez użytkownika
    getMyQuizzes() {
        return quizAPI.getMyQuizzes();
    }

    // Pobieranie quizów dla konkretnego zestawu fiszek
    async getQuizzesForDeck(deckId) {
        try {
            const response = await quizAPI.getQuizzes();
            // Filtruj quizy dla konkretnego deck
            const filteredQuizzes = response.data.filter(quiz => quiz.deckId === deckId);
            return { data: filteredQuizzes };
        } catch (error) {
            console.error('Błąd podczas pobierania quizów dla talii:', error);
            throw error;
        }
    }

    // Pobieranie konkretnego quizu
    getQuiz(quizId) {
        return quizAPI.getQuizById(quizId);
    }

    // Tworzenie nowego quizu
    createQuiz(quizData) {
        console.log('Wysyłanie danych do API:', quizData);
        return quizAPI.createQuiz(quizData);
    }

    // Pobieranie pytań do quizu
    async getQuizQuestions(quizId) {
        try {
            const response = await quizAPI.getQuizQuestions(quizId);
            return { data: response.data || [] };
        } catch (error) {
            console.error('Błąd podczas pobierania pytań quizu:', error);
            throw error;
        }
    }

    // Przesyłanie wyników quizu
    submitQuizResult(resultData) {
        return quizAPI.submitResult(resultData);
    }

    // Pobieranie wyników dla konkretnego quizu (tylko własne wyniki użytkownika)
    async getQuizResults(quizId) {
        // Ta metoda może wymagać dodatkowego endpointu w API
        try {
            const response = await quizAPI.getQuizById(quizId);
            return { data: response.data.results || [] };
        } catch (error) {
            console.error('Błąd podczas pobierania wyników quizu:', error);
            throw error;
        }
    }
    
    // Pobieranie wszystkich wyników dla konkretnego quizu (dla właściciela quizu)
    async getAllQuizResults(quizId) {
        // Ta metoda może wymagać dodatkowego endpointu w API
        try {
            const response = await quizAPI.getQuizById(quizId);
            return { data: response.data.allResults || [] };
        } catch (error) {
            console.error('Błąd podczas pobierania wszystkich wyników quizu:', error);
            throw error;
        }
    }

    // Usuwanie quizu
    deleteQuiz(quizId) {
        return quizAPI.deleteQuiz(quizId);
    }

    // Aktualizacja statusu publicznego quizu
    async updateQuizPublicStatus(quizId, isPublic) {
        // Ta metoda może wymagać dodatkowego endpointu w API
        console.log(`Aktualizacja statusu publicznego quizu ${quizId} na ${isPublic}`);
        // Na razie zwracamy sukces - można dodać endpoint później
        return Promise.resolve({ data: { success: true } });
    }
}

// Tworzymy instancję i eksportujemy ją
const quizService = new QuizService();
export default quizService; 