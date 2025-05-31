// Konfiguracja adresów API dla mikroserwisów
// W środowisku przeglądarki klient React używa lokalnego hosta, 
// a nie nazw usług wewnątrz Docker
const USER_SERVICE_URL = 'http://localhost:8080';
const FLASHCARD_SERVICE_URL = 'http://localhost:8081';
const QUIZ_SERVICE_URL = 'http://localhost:8083';
const STATISTICS_SERVICE_URL = 'http://localhost:8084';

// Domyślny adres bazowy dla mikroserwisów
const API_BASE_URL = {
  auth: `${USER_SERVICE_URL}/api/auth`,
  users: `${USER_SERVICE_URL}/api/users`,
  groups: `${USER_SERVICE_URL}/api/groups`,
  flashcards: `${FLASHCARD_SERVICE_URL}/api/flashcards`,
  decks: `${FLASHCARD_SERVICE_URL}/api/decks`,
  quizzes: `${QUIZ_SERVICE_URL}/api/quizzes`,
  statistics: `${STATISTICS_SERVICE_URL}/api/statistics`
};

export default API_BASE_URL; 