import { quizAPI } from './api';

class QuizService {
    // Pobieranie quizów dostępnych dla użytkownika
    getQuizzes() {
        return quizAPI.getQuizzes();
    }

    // Pobieranie quizów dostępnych dla użytkownika z uwzględnieniem grup
    getAvailableQuizzes(groupIds) {
        return quizAPI.getAvailableQuizzes(groupIds);
    }

    // Pobieranie quizów utworzonych przez użytkownika
    getMyQuizzes() {
        return quizAPI.getMyQuizzes();
    }

    // Pobieranie quizów dla konkretnego zestawu fiszek
    async getQuizzesForDeck(deckId) {
        try {
            // Pobierz grupy użytkownika
            const GroupService = (await import('./GroupService')).default;
            const myGroupsResponse = await GroupService.getMyGroups();
            const groupIds = myGroupsResponse.data.map(group => group.id);
            
            // Pobierz quizy z uwzględnieniem grup
            const response = await this.getAvailableQuizzes(groupIds);
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

    // Pobieranie konkretnego quizu z uwzględnieniem grup
    async getQuizWithGroups(quizId) {
        try {
            const GroupService = (await import('./GroupService')).default;
            const myGroupsResponse = await GroupService.getMyGroups();
            const groupIds = myGroupsResponse.data.map(group => group.id);
            return quizAPI.getQuizByIdWithGroups(quizId, groupIds);
        } catch (error) {
            console.error('Błąd podczas pobierania quizu z grupami:', error);
            throw error;
        }
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

    // Pobieranie pytań do quizu z uwzględnieniem grup
    async getQuizQuestionsWithGroups(quizId) {
        try {
            const GroupService = (await import('./GroupService')).default;
            const myGroupsResponse = await GroupService.getMyGroups();
            const groupIds = myGroupsResponse.data.map(group => group.id);
            const response = await quizAPI.getQuizQuestionsWithGroups(quizId, groupIds);
            return { data: response.data || [] };
        } catch (error) {
            console.error('Błąd podczas pobierania pytań quizu z grupami:', error);
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

    // Aktualizacja quizu (nazwa, opis, status publiczny, grupy)
    updateQuiz(quizId, quizData) {
        return quizAPI.updateQuiz(quizId, quizData);
    }

    // Przypisanie quizu do grup
    assignQuizToGroups(quizId, groupIds) {
        return quizAPI.assignQuizToGroups(quizId, groupIds);
    }

    // Usunięcie quizu z grup
    removeQuizFromGroups(quizId, groupIds) {
        return quizAPI.removeQuizFromGroups(quizId, groupIds);
    }

    // Pobieranie quizów dla konkretnej grupy
    getQuizzesForGroup(groupId) {
        return quizAPI.getQuizzesForGroup(groupId);
    }
}

// Tworzymy instancję i eksportujemy ją
const quizService = new QuizService();
export default quizService; 