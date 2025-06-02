# 🏗️ Mikroserwisy QuizApp - Architektura i Implementacja

## 📑 Spis treści

- [Przegląd architektury mikroserwisów](#przegląd-architektury-mikroserwisów)
- [User Service (Port 8080)](#user-service-port-8080)
- [Flashcard Service (Port 8081)](#flashcard-service-port-8081)
- [Quiz Service (Port 8083)](#quiz-service-port-8083)
- [Statistics Service (Port 8084)](#statistics-service-port-8084)
- [Frontend Service (Port 3000)](#frontend-service-port-3000)
- [Komunikacja między serwisami](#komunikacja-między-serwisami)
- [Shared Components](#shared-components)
- [Deployment i orkiestracja](#deployment-i-orkiestracja)

## Przegląd architektury mikroserwisów

System QuizApp zbudowany jest w oparciu o architekturę mikroserwisów, która zapewnia modularność, skalowalność i łatwość utrzymania. Każdy serwis ma swoją dedykowaną bazę danych (schema w PostgreSQL), własny port i zakres odpowiedzialności. Komunikacja odbywa się poprzez REST API z uwierzytelnianiem JWT.

### Mapa serwisów:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   User Service  │    │ Flashcard Serv  │    │  Quiz Service   │
│   React:3000    │    │   Spring:8080   │    │   Spring:8081   │    │   Spring:8083   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │                        │
         └────────────────────────┼────────────────────────┼────────────────────────┼─────
                                  │                        │                        │
                     ┌─────────────────┐    ┌─────────────────────────────────────────┐
                     │ Statistics Serv │    │         PostgreSQL Database             │
                     │   Spring:8084   │    │  schemas: users|flashcards|quizzes|stats│
                     └─────────────────┘    └─────────────────────────────────────────┘
```

---

## 🔐 User Service (Port 8080)

**Główny serwis zarządzający użytkownikami i bezpieczeństwem systemu.**

### 🔑 Kluczowe funkcjonalności:
- Rejestracja i autentykacja użytkowników
- Zarządzanie sesjami z JWT (access + refresh tokens)
- System ról RBAC z rolami: USER, ADMIN
- Implementacja ról RBAC (USER, ADMIN)
- Zarządzanie grupami użytkowników
- Anti-Postman Protection (ochrona przed automatyzacją)
- Rate Limiting (50 żądań/minutę)
- BCrypt password hashing

### Zakres odpowiedzialności

User Service jest głównym punktem uwierzytelniania i autoryzacji w systemie. Zarządza użytkownikami, ich rolami, grupami oraz tokenami JWT. Jest to jedyny serwis, który może tworzyć i weryfikować tokeny dostępu.

### Główne funkcjonalności:

**Autentykacja i autoryzacja:**
- Rejestracja nowych użytkowników z walidacją danych
- Logowanie z hashowaniem haseł BCrypt
- Zarządzanie tokenami JWT (access i refresh)
- Implementacja ról RBAC (USER, ADMIN)

**Zarządzanie użytkownikami:**
- CRUD operacje na profilach użytkowników
- Lista użytkowników z paginacją dla administratorów
- Publiczny endpoint do pobierania nazw użytkowników po ID

**Zarządzanie grupami:**
- Tworzenie i administrowanie grupami edukacyjnymi
- Dodawanie/usuwanie członków grup
- Kontrola dostępu do zasobów na poziomie grup

### Struktura kodu:

```
user-service/
├── src/main/java/com/quizapp/userservice/
│   ├── config/
│   │   ├── JwtTokenProvider.java      # Generowanie i walidacja JWT
│   │   ├── SecurityConfig.java        # Konfiguracja Spring Security
│   │   └── RateLimitConfig.java       # Rate limiting configuration
│   ├── controller/
│   │   ├── AuthController.java        # Endpointy autentykacji
│   │   ├── UserController.java        # Zarządzanie użytkownikami
│   │   └── GroupController.java       # Zarządzanie grupami
│   ├── model/
│   │   ├── User.java                  # Encja użytkownika
│   │   ├── Role.java                  # Encja roli
│   │   ├── Group.java                 # Encja grupy
│   │   └── RefreshToken.java          # Encja refresh tokenu
│   ├── repository/
│   │   ├── UserRepository.java        # Repozytorium użytkowników
│   │   ├── RoleRepository.java        # Repozytorium ról
│   │   └── GroupRepository.java       # Repozytorium grup
│   ├── service/
│   │   ├── UserService.java           # Logika biznesowa użytkowników
│   │   ├── AuthService.java           # Logika autentykacji
│   │   └── GroupService.java          # Logika grup
│   └── dto/
│       ├── LoginRequest.java          # DTO żądania logowania
│       ├── JwtResponse.java           # DTO odpowiedzi JWT
│       └── UserResponse.java          # DTO odpowiedzi użytkownika
```

### Baza danych:
- **Schema**: `users`
- **Tabele**: users, roles, user_roles, groups, group_members, refresh_tokens

---

## 📚 Flashcard Service (Port 8081)

### Zakres odpowiedzialności

Flashcard Service zarządza systemem fiszek edukacyjnych. Umożliwia tworzenie zestawów fiszek, dodawanie pojedynczych fiszek oraz import z plików CSV/TXT. Obsługuje również autoryzację na poziomie grup dla udostępniania materiałów edukacyjnych.

### Główne funkcjonalności:

**Zarządzanie zestawami fiszek:**
- Tworzenie i edycja zestawów fiszek z metadanymi
- Udostępnianie zestawów konkretnym grupom użytkowników
- Filtrowanie zestawów po użytkowniku lub grupie
- Soft delete dla zachowania integralności danych

**Zarządzanie fiszkami:**
- Dodawanie fiszek do zestawów (pytanie/odpowiedź)
- Edycja i usuwanie pojedynczych fiszek
- Walidacja długości tekstów i formatowania

**Import/Export:**
- Import fiszek z plików CSV (format: pytanie,odpowiedź)
- Import z plików TXT (format: pytanie|odpowiedź na linię)
- Walidacja i sanityzacja importowanych danych

### Struktura kodu:

```
flashcard-service/
├── src/main/java/com/quizapp/flashcardservice/
│   ├── config/
│   │   ├── SecurityConfig.java        # Konfiguracja bezpieczeństwa
│   │   └── CorsConfig.java            # Konfiguracja CORS
│   ├── controller/
│   │   ├── FlashcardDeckController.java   # Endpointy zestawów
│   │   ├── FlashcardController.java       # Endpointy fiszek
│   │   └── ImportController.java          # Endpointy importu
│   ├── model/
│   │   ├── FlashcardDeck.java         # Encja zestawu fiszek
│   │   └── Flashcard.java             # Encja fiszki
│   ├── repository/
│   │   ├── FlashcardDeckRepository.java   # Repozytorium zestawów
│   │   └── FlashcardRepository.java       # Repozytorium fiszek
│   ├── service/
│   │   ├── FlashcardDeckService.java      # Logika zestawów
│   │   ├── FlashcardService.java          # Logika fiszek
│   │   └── ImportService.java             # Logika importu
│   └── dto/
│       ├── FlashcardDeckRequest.java      # DTO żądania zestawu
│       ├── FlashcardRequest.java          # DTO żądania fiszki
│       └── ImportResponse.java            # DTO odpowiedzi importu
```

### Baza danych:
- **Schema**: `flashcards`
- **Tabele**: flashcard_decks, flashcards

### Integracja z innymi serwisami:
- Komunikuje się z User Service w celu weryfikacji uprawnień grupowych
- Statistics Service może pobierać dane o aktywności fiszek

---

## 🧠 Quiz Service (Port 8083)

### Zakres odpowiedzialności

Quiz Service jest odpowiedzialny za kompleksowy system quizów edukacyjnych. Zarządza tworzeniem quizów, pytaniami, typami odpowiedzi oraz zapisywaniem i pobieraniem wyników. Obsługuje różne typy pytań i zaawansowaną logikę punktowania.

### Główne funkcjonalności:

**Zarządzanie quizami:**
- Tworzenie quizów z metadanymi (tytuł, opis, widoczność)
- Przypisywanie quizów do grup użytkowników
- Filtrowanie i wyszukiwanie quizów po różnych kryteriach
- Kontrola dostępu na poziomie użytkowników i grup

**Zarządzanie pytaniami:**
- Tworzenie pytań różnych typów (wielokrotny wybór, prawda/fałsz, tekstowe)
- Definiowanie opcji odpowiedzi dla pytań wielokrotnego wyboru
- System punktowania za pytania
- Walidacja poprawności pytań i odpowiedzi

**System wyników:**
- Zapisywanie kompletnych wyników quizów z szczegółami odpowiedzi
- Obliczanie procentowego wyniku i punktacji
- Historia wszystkich prób rozwiązania quizów
- Analityka wydajności użytkowników

### Struktura kodu:

```
quiz-service/
├── src/main/java/com/quizapp/quizservice/
│   ├── config/
│   │   ├── SecurityConfig.java        # Konfiguracja bezpieczeństwa
│   │   └── JpaConfig.java             # Konfiguracja JPA
│   ├── controller/
│   │   ├── QuizController.java        # Endpointy quizów
│   │   ├── QuizQuestionController.java # Endpointy pytań
│   │   └── QuizResultController.java   # Endpointy wyników
│   ├── model/
│   │   ├── Quiz.java                  # Encja quizu
│   │   ├── QuizQuestion.java          # Encja pytania
│   │   ├── QuizResult.java            # Encja wyniku
│   │   └── QuizGroup.java             # Encja przypisania do grup
│   ├── repository/
│   │   ├── QuizRepository.java        # Repozytorium quizów
│   │   ├── QuizQuestionRepository.java # Repozytorium pytań
│   │   └── QuizResultRepository.java   # Repozytorium wyników
│   ├── service/
│   │   ├── QuizService.java           # Logika quizów
│   │   ├── QuizQuestionService.java   # Logika pytań
│   │   └── QuizResultService.java     # Logika wyników
│   └── dto/
│       ├── QuizRequest.java           # DTO żądania quizu
│       ├── QuizQuestionRequest.java   # DTO żądania pytania
│       └── QuizResultRequest.java     # DTO żądania wyniku
```

### Typy pytań obsługiwane:
- **MULTIPLE_CHOICE**: Pytania z 4 opcjami odpowiedzi (A, B, C, D)
- **TEXT**: Pytania otwarte z odpowiedzią tekstową (planowane)

### Baza danych:
- **Schema**: `quizzes`
- **Tabele**: quizzes, quiz_groups, quiz_questions, quiz_results

---

## 📊 Statistics Service (Port 8084)

### Zakres odpowiedzialności

Statistics Service odpowiada za zbieranie, agregację i analizę danych statystycznych z całego systemu. Generuje raporty wydajności, rankingi użytkowników oraz analitykę aktywności w quizach i fiszkach.

### Główne funkcjonalności:

**Zbieranie statystyk:**
- Automatyczne zapisywanie statystyk ukończonych quizów
- Zbieranie danych o aktywności użytkowników
- Integracja z pozostałymi serwisami dla zbierania metryk

**Analityka użytkowników:**
- Szczegółowe statystyki wydajności każdego użytkownika
- Historia aktywności i progres edukacyjny
- Analiza słabych i mocnych stron w nauce

**Analityka quizów:**
- Statystyki popularności quizów
- Analiza trudności pytań na podstawie odpowiedzi
- Ranking najlepszych quizów i najaktywniejszych twórców

**Rankingi i leaderboardy:**
- Globalne rankingi użytkowników
- Rankingi w ramach grup edukacyjnych
- Systemy osiągnięć i progresji

### Struktura kodu:

```
statistics-service/
├── src/main/java/com/quizapp/statisticsservice/
│   ├── config/
│   │   └── SecurityConfig.java        # Konfiguracja bezpieczeństwa
│   ├── controller/
│   │   ├── StatisticsController.java  # Endpointy statystyk
│   │   └── AnalyticsController.java   # Endpointy analityki
│   ├── model/
│   │   └── QuizStatistics.java        # Encja statystyk quizu
│   ├── repository/
│   │   └── QuizStatisticsRepository.java # Repozytorium statystyk
│   ├── service/
│   │   ├── StatisticsService.java     # Logika statystyk
│   │   └── AnalyticsService.java      # Logika analityki
│   └── dto/
│       ├── UserStatsResponse.java     # DTO statystyk użytkownika
│       ├── QuizAnalyticsResponse.java # DTO analityki quizu
│       └── LeaderboardResponse.java   # DTO rankingu
```

### Baza danych:
- **Schema**: `statistics`
- **Tabele**: quiz_statistics (planowane rozszerzenie o flashcard_statistics)

---

## 🎨 Frontend Service (Port 3000)

### Zakres odpowiedzialności

Frontend Service to aplikacja React, która stanowi interfejs użytkownika dla całego systemu QuizApp. Zapewnia responsywny i intuicyjny interfejs do korzystania ze wszystkich funkcjonalności systemu.

### Główne funkcjonalności:

**Autentykacja i nawigacja:**
- Formularze logowania i rejestracji z walidacją
- Automatyczne odświeżanie tokenów JWT
- Protected routes dla zalogowanych użytkowników
- Nawigacja dostosowana do ról użytkownika

**Zarządzanie fiszkami:**
- Interfejs do tworzenia i edycji zestawów fiszek
- System importu plików CSV/TXT
- Interfejs do nauki z fiszkami z funkcją flip
- Udostępnianie zestawów grupom

**System quizów:**
- Kreator quizów z różnymi typami pytań
- Interfejs rozwiązywania quizów z timerem
- Wyświetlanie wyników z szczegółową analizą
- Historia wszystkich rozwiązanych quizów

**Statystyki i analityka:**
- Dashboardy z wykresami wydajności
- Rankingi użytkowników i grup
- Analiza progresji w nauce
- Eksport raportów do PDF/Excel

### Technologie:
- **React 18** z Hooks API
- **React Router** dla nawigacji
- **Axios** dla komunikacji API
- **Material-UI/MUI** dla komponentów UI
- **Chart.js** dla wykresów statystyk
- **React Hook Form** dla formularzy

### Struktura projektu:
```
frontend/
├── src/
│   ├── components/          # Komponenty wielokrotnego użytku
│   ├── pages/              # Strony aplikacji
│   ├── services/           # Serwisy API
│   ├── context/            # Context API dla stanu globalnego
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Funkcje pomocnicze
│   └── styles/             # Style CSS/SCSS
```

---

## 🔗 Komunikacja między serwisami

### Architektura komunikacji

System QuizApp implementuje synchroniczną komunikację między mikroserwisami za pomocą REST API. Wszystkie żądania są uwierzytelniane przy użyciu tokenów JWT i nagłówka X-User-ID.

### Główne przepływy komunikacji:

**Autentykacja przepływowa:**
```
Frontend → User Service (login)
Frontend ← User Service (JWT tokens)
Frontend → [Any Service] (with JWT header)
[Any Service] → User Service (token validation)
```

**Quiz przepływ:**
```
Frontend → Quiz Service (create quiz)
Quiz Service → User Service (verify groups)
Frontend → Statistics Service (quiz completed)
Statistics Service → Quiz Service (get quiz details)
```

**Flashcard przepływ:**
```
Frontend → Flashcard Service (create deck)
Flashcard Service → User Service (verify groups)
Frontend → Statistics Service (study session)
```

### Zabezpieczenia komunikacji:

**Wspólny klucz JWT:**
Wszystkie serwisy używają tego samego klucza do weryfikacji tokenów, co zapewnia seamless authentication między mikroserwisami.

**Rate Limiting:**
Każdy serwis implementuje rate limiting (50 żądań/minutę) dla ochrony przed atakami DDoS.

**CORS Policy:**
Ściśle kontrolowana polityka CORS pozwalająca tylko na żądania z frontendu (localhost:3000).

---

## 🔧 Shared Components

### Wspólne biblioteki i konfiguracje

**Spring Security Configuration:**
Wszystkie mikroserwisy używają podobnej konfiguracji Spring Security z drobnymi różnicami dostosowanymi do specyfiki serwisu.

**JWT Authentication Filter:**
Implementacja filtra JWT jest wspólna dla wszystkich serwisów backend-owych.

**Exception Handling:**
Ustandaryzowana obsługa błędów z odpowiednimi kodami HTTP i komunikatami.

**Database Configuration:**
Wszystkie serwisy łączą się z tą samą instancją PostgreSQL, ale używają różnych schematów.

---

## 🚀 Deployment i orkiestracja

### Docker Compose

System jest zorkiestrowany przy użyciu Docker Compose, co zapewnia łatwy deployment i zarządzanie wszystkimi serwisami.

**docker-compose.yml structure:**
```yaml
services:
  postgres:          # PostgreSQL database
  user-service:      # User microservice
  flashcard-service: # Flashcard microservice  
  quiz-service:      # Quiz microservice
  statistics-service: # Statistics microservice
  frontend:          # React frontend
```

### Environment Variables

Wszystkie wrażliwe konfiguracje są przekazywane przez zmienne środowiskowe:
- JWT secret keys
- Database credentials  
- Service URLs
- Security settings

### Health Checks

Każdy serwis implementuje health check endpoints dla monitorowania stanu:
- `/actuator/health` dla serwisów Spring Boot
- Custom health endpoints dla frontendu

### Scaling Strategy

Architektura umożliwia niezależne skalowanie każdego mikroserwisu:
- **User Service**: Może wymagać większej skalowalności ze względu na autentykację
- **Quiz Service**: Scaling w zależności od liczby aktywnych quizów
- **Frontend**: CDN i load balancing dla static assets
- **Database**: Read replicas dla operacji odczytu

---

## 📈 Metryki i monitoring

### Application Metrics

**Spring Boot Actuator:**
- Health checks
- Metrics endpoint
- Environment info
- Thread dumps

**Custom Metrics:**
- Liczba aktywnych użytkowników
- Statystyki rozwiązanych quizów
- Performance query database
- API response times

### Logging Strategy

**Structured Logging:**
- JSON format dla łatwego parsowania
- Correlation IDs dla tracking żądań między serwisami
- Different log levels (DEBUG, INFO, WARN, ERROR)

**Log Aggregation:**
- Centralized logging z ELK Stack (planowane)
- Log rotation i archiwizacja
- Real-time log monitoring

---

## 🔒 Security per Service

### Service-specific Security

**User Service:**
- BCrypt password hashing
- JWT token generation/validation
- Rate limiting na endpointach logowania
- Account lockout po failed attempts

**Flashcard Service:**
- Group-based authorization
- File upload validation
- Input sanitization dla importu

**Quiz Service:**  
- Quiz access control
- Result integrity validation
- Anti-cheating measures (planowane)

**Statistics Service:**
- Data anonymization opcje
- GDPR compliance dla user data
- Audit trails dla sensitive operations

---

## 🚦 Monitoring i Alerting

### Health Monitoring

**Service Health:**
- Database connectivity checks
- Inter-service communication checks
- Memory i CPU utilization
- Disk space monitoring

**Business Metrics:**
- User registration rates
- Quiz completion rates
- System response times
- Error rates per service

### Alerting Strategy

**Critical Alerts:**
- Service downtime
- Database connection failures
- High error rates (>5%)
- Security incidents

**Warning Alerts:**
- High response times (>2s)
- Memory usage >80%
- Unusual traffic patterns
- Failed authentications spikes

System QuizApp w architekturze mikroserwisów zapewnia skalowalność, maintainability i security na poziomie enterprise. Każdy serwis ma jasno określone boundaries i responsibilities, co ułatwia development, testing i deployment. 