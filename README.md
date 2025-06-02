# QuizApp - Platforma Edukacyjna z Quizami i Fiszkami

## 📚 Dokumentacja Kompletna

**🎯 Pełna dokumentacja systemu dostępna jest w VitePress:**

```bash
# Uruchomienie dokumentacji
cd docs-vitepress
npm install
npm run dev
```

Dokumentacja będzie dostępna pod adresem: `http://localhost:5173`

### Zawiera:
- 🏗️ **Mikroserwisy** - szczegółowa architektura systemu
- 🔗 **API Endpointy** - kompletna dokumentacja API (61 endpointów)
- 🗄 **Baza Danych** - schematy wszystkich tabel (12 tabel w 4 schematach)
- 🔒 **Zabezpieczenia** - JWT, CORS, Rate Limiting, Anti-Postman

---

## Spis treści
- [Opis ogólny](#opis-ogólny)
- [Architektura systemu](#architektura-systemu)
  - [Mikroserwisy](#mikroserwisy)
  - [Komunikacja](#komunikacja)
  - [Infrastruktura](#infrastruktura)
- [Szczegóły techniczne](#szczegóły-techniczne)
  - [User Service](#user-service)
  - [Flashcard Service](#flashcard-service)
  - [Quiz Service](#quiz-service)
  - [Statistics Service](#statistics-service)
  - [Frontend](#frontend)
- [Struktura bazy danych](#struktura-bazy-danych)
- [Zabezpieczenia](#zabezpieczenia)
- [Dokumentacja API](#dokumentacja-api)
- [Dockeryzacja](#dockeryzacja)
- [Uruchomienie projektu](#uruchomienie-projektu)
- [Dokumentacja dodatkowa](#dokumentacja-dodatkowa)

## Opis ogólny

QuizApp to kompleksowa platforma edukacyjna, która umożliwia:
- Tworzenie, udostępnianie i rozwiązywanie quizów edukacyjnych
- Zarządzanie zestawami fiszek (flashcards) do nauki
- Monitorowanie postępów nauki poprzez statystyki
- Importowanie fiszek z plików CSV i TXT

Aplikacja wykorzystuje nowoczesną architekturę mikroserwisową, zapewniając skalowalność, odporność na awarie i łatwość rozwoju poszczególnych komponentów.

## Architektura systemu

### Mikroserwisy

System składa się z następujących mikroserwisów, każdy odpowiedzialny za konkretną domenę biznesową:

1. **User Service**
   - Zarządzanie użytkownikami i ich rolami
   - Rejestracja i logowanie (JWT)
   - Zarządzanie profilami użytkowników
   - Obsługa sesji i tokenów odświeżania

2. **Flashcard Service**
   - Tworzenie i zarządzanie zestawami fiszek
   - Import/eksport fiszek z plików CSV i TXT
   - Zarządzanie własnymi i publicznymi zestawami fiszek

3. **Quiz Service**
   - Tworzenie i zarządzanie quizami
   - Rozwiązywanie quizów
   - Zapisywanie wyników quizów

4. **Statistics Service**
   - Zbieranie i analiza wyników quizów
   - Generowanie statystyk użytkownika
   - Śledzenie postępów nauki

5. **Frontend**
   - Interfejs użytkownika oparty na React
   - Responsywny design (Bootstrap)
   - Wizualizacja statystyk (Chart.js)

### Komunikacja

Komunikacja między komponentami odbywa się za pomocą:
- RESTful API (synchroniczna komunikacja między mikroserwisami i frontendem)
- Tokeny JWT do autoryzacji między serwisami
- Nagłówek "X-User-ID" do przekazywania identyfikatora użytkownika między serwisami
- Współdzielona baza danych PostgreSQL z oddzielnymi schematami dla każdego mikroserwisu

### Infrastruktura

- **Backend**: Java 17, Spring Boot, Spring Security, Spring Data JPA
- **Frontend**: React 18, Bootstrap 5, React Router, Axios, Chart.js
- **Baza danych**: PostgreSQL 14 (schemat dedykowany dla każdego mikroserwisu)
- **Konteneryzacja**: Docker + Docker Compose
- **Autoryzacja**: JWT (JSON Web Tokens)

## Szczegóły techniczne

### User Service

#### Główne funkcjonalności
- Rejestracja użytkowników
- Logowanie i wydawanie tokenów JWT
- Odświeżanie tokenów
- Zarządzanie profilem użytkownika
- Zarządzanie rolami użytkowników (ADMIN, USER)

#### Kluczowe komponenty
- **JwtTokenProvider**: Generowanie i walidacja tokenów JWT
- **JwtAuthenticationFilter**: Filtrowanie i weryfikacja żądań
- **AuthController**: Endpointy autoryzacji
- **UserController**: Zarządzanie użytkownikami

#### Endpointy
- **POST /api/auth/register** - rejestracja nowego użytkownika
- **POST /api/auth/login** - logowanie użytkownika
- **POST /api/auth/refresh-token** - odświeżanie tokenu JWT
- **POST /api/auth/logout** - wylogowanie użytkownika
- **GET /api/users/me** - pobieranie danych zalogowanego użytkownika
- **PUT /api/users/me** - aktualizacja danych użytkownika
- **GET /api/users/{id}** - pobieranie użytkownika po ID (tylko ADMIN)
- **GET /api/users** - pobieranie listy użytkowników (tylko ADMIN)
- **POST /api/users/usernames** - pobieranie nazw użytkowników po ID
- **PUT /api/users/{id}/role** - zmiana roli użytkownika (tylko ADMIN)
- **DELETE /api/users/{id}** - usunięcie użytkownika (tylko ADMIN)

### Flashcard Service

#### Główne funkcjonalności
- Tworzenie zestawów fiszek
- Dodawanie/edycja/usuwanie fiszek
- Udostępnianie zestawów publicznie
- Import fiszek z plików CSV i TXT

#### Kluczowe komponenty
- **FlashcardDeckController**: Zarządzanie zestawami fiszek
- **FlashcardController**: Zarządzanie fiszkami w zestawach

#### Endpointy
- **GET /api/decks/my** - pobieranie zestawów fiszek użytkownika
- **GET /api/decks/public** - pobieranie publicznych zestawów fiszek
- **GET /api/decks/{id}** - pobieranie zestawu fiszek po ID
- **POST /api/decks** - tworzenie nowego zestawu fiszek
- **PUT /api/decks/{id}** - aktualizacja zestawu fiszek
- **DELETE /api/decks/{id}** - usunięcie zestawu fiszek
- **POST /api/decks/{id}/import/csv** - import fiszek z pliku CSV
- **POST /api/decks/{id}/import/txt** - import fiszek z pliku TXT

### Quiz Service

#### Główne funkcjonalności
- Tworzenie quizów z różnymi typami pytań
- Rozwiązywanie quizów
- Ocenianie odpowiedzi
- Zapisywanie wyników

#### Kluczowe komponenty
- **QuizController**: Zarządzanie quizami, pytaniami i wynikami

#### Endpointy
- **POST /api/quizzes** - tworzenie nowego quizu
- **GET /api/quizzes** - pobieranie quizów dostępnych dla użytkownika
- **GET /api/quizzes/my** - pobieranie quizów utworzonych przez użytkownika
- **GET /api/quizzes/{quizId}** - pobieranie quizu po ID
- **GET /api/quizzes/{quizId}/questions** - pobieranie pytań quizu
- **POST /api/quizzes/results** - zapisywanie wyniku quizu
- **GET /api/quizzes/{quizId}/results** - pobieranie wyników quizu użytkownika
- **GET /api/quizzes/{quizId}/all-results** - pobieranie wszystkich wyników quizu
- **DELETE /api/quizzes/{quizId}** - usunięcie quizu
- **PATCH /api/quizzes/{quizId}/public** - zmiana statusu publicznego quizu

### Statistics Service

#### Główne funkcjonalności
- Zbieranie wyników quizów
- Generowanie statystyk użytkownika
- Analiza postępów w nauce

#### Kluczowe komponenty
- **StatisticsController**: Zarządzanie statystykami quizów

#### Endpointy
- **POST /api/statistics/results** - zapisywanie wyniku quizu
- **GET /api/statistics/quizzes/{quizId}/results** - pobieranie wyników quizu użytkownika
- **GET /api/statistics/quizzes/{quizId}/all-results** - pobieranie wszystkich wyników quizu
- **GET /api/statistics/users/results** - pobieranie wszystkich wyników użytkownika
- **GET /api/statistics/health** - sprawdzanie statusu serwisu

### Frontend

#### Główne funkcjonalności
- Interfejs użytkownika zbudowany w React
- Responsywny design z Bootstrap
- Interaktywne formularze do tworzenia quizów i fiszek
- Wizualizacja wyników i statystyk

#### Kluczowe komponenty
- **Login/Register** - formularze uwierzytelniania
- **Dashboard** - panel główny użytkownika
- **QuizCreate/QuizList/QuizPlay** - zarządzanie quizami
- **FlashcardDecks/FlashcardDeckEdit/FlashcardAnkiMode** - zarządzanie fiszkami
- **QuizStatistics** - wizualizacja wyników i postępów

## Struktura bazy danych

Baza danych PostgreSQL jest podzielona na schematy odpowiadające poszczególnym mikroserwisom:

### Schema: users
- **users** - dane użytkowników
  - `id` BIGSERIAL (PK) - unikalne ID użytkownika
  - `username` VARCHAR(50) UNIQUE - nazwa użytkownika
  - `email` VARCHAR(100) UNIQUE - adres email
  - `password` VARCHAR(120) - zahashowane hasło
  - `first_name` VARCHAR(50) - imię
  - `last_name` VARCHAR(50) - nazwisko
  - `created_at` TIMESTAMP - data utworzenia
  - `updated_at` TIMESTAMP - data aktualizacji

- **roles** - role systemowe
  - `id` BIGSERIAL (PK) - unikalne ID roli
  - `name` VARCHAR(20) - nazwa roli (ADMIN, USER)

- **user_roles** - powiązania użytkowników z rolami
  - `user_id` BIGINT (FK -> users.id) - ID użytkownika
  - `role_id` BIGINT (FK -> roles.id) - ID roli
  - PRIMARY KEY (user_id, role_id)

- **refresh_tokens** - tokeny odświeżania
  - `id` BIGSERIAL (PK) - unikalne ID tokenu
  - `user_id` BIGINT (FK -> users.id) - ID użytkownika
  - `token` VARCHAR(255) UNIQUE - token odświeżania
  - `expires_at` TIMESTAMP - data wygaśnięcia
  - `created_at` TIMESTAMP - data utworzenia

### Schema: flashcards
- **flashcard_decks** - zestawy fiszek
  - `id` BIGSERIAL (PK) - unikalne ID zestawu
  - `name` VARCHAR(255) - nazwa zestawu
  - `description` TEXT - opis zestawu
  - `user_id` BIGINT - ID właściciela zestawu
  - `is_public` BOOLEAN - czy zestaw jest publiczny
  - `created_at` TIMESTAMP - data utworzenia
  - `updated_at` TIMESTAMP - data aktualizacji

- **flashcards** - fiszki
  - `id` BIGSERIAL (PK) - unikalne ID fiszki
  - `term` VARCHAR(255) - hasło (przednia strona fiszki)
  - `definition` TEXT - definicja (tylna strona fiszki)
  - `image_path` VARCHAR(255) - ścieżka do obrazu (opcjonalnie)
  - `deck_id` BIGINT (FK -> flashcard_decks.id) - ID zestawu
  - `created_at` TIMESTAMP - data utworzenia
  - `updated_at` TIMESTAMP - data aktualizacji

### Schema: quizzes
- **quizzes** - quizy
  - `id` BIGSERIAL (PK) - unikalne ID quizu
  - `name` VARCHAR(255) - nazwa quizu
  - `description` TEXT - opis quizu
  - `user_id` BIGINT - ID właściciela quizu
  - `is_public` BOOLEAN - czy quiz jest publiczny
  - `question_count` INTEGER - liczba pytań
  - `created_at` TIMESTAMP - data utworzenia
  - `updated_at` TIMESTAMP - data aktualizacji

- **quiz_questions** - pytania w quizach
  - `id` BIGSERIAL (PK) - unikalne ID pytania
  - `quiz_id` BIGINT (FK -> quizzes.id) - ID quizu
  - `question` VARCHAR(255) - treść pytania
  - `answers` TEXT[] - tablica możliwych odpowiedzi
  - `correct_answer_index` INTEGER - indeks poprawnej odpowiedzi
  - `created_at` TIMESTAMP - data utworzenia

- **quiz_results** - wyniki quizów
  - `id` BIGSERIAL (PK) - unikalne ID wyniku
  - `quiz_id` BIGINT (FK -> quizzes.id) - ID quizu
  - `user_id` BIGINT - ID użytkownika
  - `score` INTEGER - liczba zdobytych punktów
  - `total_questions` INTEGER - całkowita liczba pytań
  - `duration_in_seconds` BIGINT - czas rozwiązywania w sekundach
  - `completed_at` TIMESTAMP - data ukończenia
  - `created_at` TIMESTAMP - data utworzenia

### Schema statistics
- **quiz_statistics** - statystyki quizów
  - `id` BIGSERIAL (PK) - unikalne ID statystyki
  - `quiz_id` BIGINT - ID quizu
  - `user_id` BIGINT - ID użytkownika
  - `score` INTEGER - liczba zdobytych punktów
  - `total_questions` INTEGER - całkowita liczba pytań
  - `duration_in_seconds` BIGINT - czas rozwiązywania w sekundach
  - `completed_at` TIMESTAMP - data ukończenia
  - `created_at` TIMESTAMP - data utworzenia

### Schema: groups (opcjonalnie)
- **groups** - grupy użytkowników
  - `id` BIGSERIAL (PK) - unikalne ID grupy
  - `name` VARCHAR(255) - nazwa grupy
  - `description` TEXT - opis grupy
  - `created_at` TIMESTAMP - data utworzenia
  - `updated_at` TIMESTAMP - data aktualizacji

- **group_members** - członkowie grup
  - `group_id` BIGINT (FK -> groups.id) - ID grupy
  - `user_id` BIGINT - ID użytkownika
  - `role` VARCHAR(50) - rola w grupie (ADMIN, MEMBER)
  - `joined_at` TIMESTAMP - data dołączenia
  - PRIMARY KEY (group_id, user_id)

- **group_materials** - materiały przypisane do grup
  - `id` BIGSERIAL (PK) - unikalne ID materiału
  - `group_id` BIGINT (FK -> groups.id) - ID grupy
  - `material_type` VARCHAR(50) - typ materiału (FLASHCARD_SET, QUIZ)
  - `material_id` BIGINT - ID materiału
  - `added_at` TIMESTAMP - data dodania

## Zabezpieczenia

System QuizApp wykorzystuje wielopoziomowe zabezpieczenia zapewniające ochronę danych użytkowników i integralność aplikacji.

### 🔐 Autentykacja

#### JWT (JSON Web Tokens)
- **Bezstanowa autentykacja**: Tokeny JWT są używane do uwierzytelniania użytkowników bez konieczności przechowywania sesji na serwerze
- **Wspólny klucz tajny**: Wszystkie mikroserwisy używają tego samego klucza JWT: `MIkolajKrawczakJWTSecretKey2025SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny`
- **Czas wygaśnięcia**: Tokeny JWT wygasają po 24 godzinach (86400000 ms)
- **Refresh tokeny**: Tokeny odświeżania ważne przez 7 dni (604800000 ms)

#### Konfiguracja JWT w mikroserwisach

**Zmienne środowiskowe (docker-compose.yml):**
```yaml
environment:
  APP_JWT_SECRET: "MIkolajKrawczakJWTSecretKey2025SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny"
```

**Konfiguracja w application.properties:**
```properties
app.jwt.secret=MIkolajKrawczakJWTSecretKey2025SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny
app.jwt.expiration=86400000
app.jwt.refresh-expiration=604800000
```

#### Komponenty JWT

**JwtTokenProvider**
- Generowanie tokenów JWT na podstawie danych użytkownika
- Walidacja tokenów i sprawdzanie ich ważności
- Wyciąganie informacji o użytkowniku z tokenu

**JwtAuthenticationFilter**
- Automatyczne filtrowanie wszystkich żądań HTTP
- Wyciąganie tokenu z nagłówka `Authorization: Bearer <token>`
- Ustawianie kontekstu uwierzytelnienia Spring Security

### 🛡️ Autoryzacja

#### System ról
- **ROLE_USER**: Standardowy użytkownik systemu
- **ROLE_ADMIN**: Administrator z rozszerzonymi uprawnieniami

#### Kontrola dostępu do zasobów
- **Własność zasobów**: Użytkownicy mogą modyfikować tylko własne zasoby (quizy, fiszki)
- **Publiczne zasoby**: Dostęp do publicznych quizów i zestawów fiszek dla wszystkich użytkowników
- **Adnotacje Spring Security**: `@PreAuthorize` do kontroli dostępu na poziomie metod

#### Przykłady kontroli dostępu:
```java
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public ResponseEntity<User> getCurrentUser()

@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<User>> getAllUsers()
```

### 🔒 Bezpieczeństwo komunikacji

#### Nagłówki bezpieczeństwa

**Wymagane nagłówki dla komunikacji frontend-backend:**
- `Authorization: Bearer <jwt-token>` - token uwierzytelniania
- `X-User-ID: <user-id>` - identyfikator użytkownika
- `Content-Type: application/json` - typ zawartości
- `Origin: http://localhost:3000` - pochodzenie żądania
- `X-Requested-With: XMLHttpRequest` - identyfikacja żądań AJAX

**SecurityService (frontend)**
Frontend automatycznie dodaje wymagane nagłówki bezpieczeństwa do każdego żądania:

```javascript
// Request interceptor w api.js
config = securityService.enhanceRequestConfig(config);
```

### 🛡️ AntiPostmanFilter (WYŁĄCZONY)

**Status**: AntiPostmanFilter jest obecnie **WYŁĄCZONY** we wszystkich mikroserwisach dla zapewnienia płynności działania aplikacji.

**Konfiguracja:**
```properties
# W application.properties
app.security.anti-postman.enabled=false

# W docker-compose.yml
APP_SECURITY_ANTI_POSTMAN_ENABLED: "false"
```

**Co blokował AntiPostmanFilter (gdy był włączony):**
- Żądania z podejrzanych User-Agent (curl, Postman, Insomnia)
- Żądania bez wymaganych nagłówków przeglądarki
- Żądania bez poprawnego podpisu klienta
- Żądania z niepoprawnego Origin/Referer

**Algorytm podpisu klienta:**
```javascript
// Generowanie podpisu bezpieczeństwa
const signature = Integer.toHexString((timestamp + path + clientSecret).hashCode());
```

### 🌐 CORS (Cross-Origin Resource Sharing)

**Konfiguracja CORS:**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList(
        "authorization", 
        "content-type", 
        "x-auth-token", 
        "X-User-ID",
        "X-Requested-With",
        "X-Client-Signature",
        "X-Timestamp",
        "Accept",
        "Accept-Language",
        "Accept-Encoding"
    ));
    configuration.setAllowCredentials(true);
    return source;
}
```

### 🔐 Bezpieczeństwo haseł

#### Hashowanie
- **BCrypt**: Algorytm hashowania haseł z automatycznym soleniem
- **Strength**: Domyślna siła BCrypt (10 rund)

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

### 📊 Rate Limiting

**Status**: Rate Limiting jest włączony w user-service.

**Konfiguracja:**
```properties
app.security.rate-limit.enabled=true
app.security.rate-limit.max-requests=50
app.security.rate-limit.window-size=60000
```

**Limity:**
- Maksymalnie 50 żądań na minutę na IP
- Okno czasowe: 60 sekund
- Automatyczne resetowanie liczników

### 🛠️ Konfiguracja bezpieczeństwa mikroserwisów

#### User Service
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // JWT Authentication Filter
    // Rate Limiting Filter
    // AntiPostman Filter (wyłączony)
    // CORS Configuration
}
```

#### Flashcard Service & Quiz Service
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // JWT Authentication Filter
    // AntiPostman Filter (wyłączony w quiz-service)
    // CORS Configuration
}
```

#### Statistics Service
- **Minimalna konfiguracja**: Tylko podstawowe CORS
- **Brak zaawansowanych filtrów**: Publiczny dostęp do niektórych endpointów
- **Walidacja User-ID**: Opcjonalna w niektórych endpointach

### 🔍 Monitoring i logowanie bezpieczeństwa

**Logi bezpieczeństwa:**
```properties
logging.level.com.example.userservice.security.AntiPostmanFilter=INFO
logging.level.com.example.userservice.security.RateLimitingFilter=INFO
logging.level.com.example.userservice.security.JwtAuthenticationFilter=DEBUG
```

**Monitorowane zdarzenia:**
- Nieudane próby uwierzytelnienia JWT
- Zablokowane żądania przez filtry bezpieczeństwa
- Przekroczone limity żądań (Rate Limiting)
- Próby dostępu do zasobów bez autoryzacji

### ⚠️ Znane ograniczenia bezpieczeństwa

1. **AntiPostmanFilter wyłączony**: Dla zapewnienia funkcjonalności aplikacji
2. **Wspólny JWT secret**: Wszystkie mikroserwisy używają tego samego klucza
3. **HTTP komunikacja**: Brak HTTPS w środowisku deweloperskim
4. **Brak rotacji kluczy**: JWT secret nie jest automatycznie rotowany

### 🔧 Zalecenia dla środowiska produkcyjnego

1. **Włącz HTTPS**: Wszystka komunikacja powinna być szyfrowana
2. **Rotacja kluczy JWT**: Regularna zmiana JWT secret
3. **Monitoring bezpieczeństwa**: Implementacja alertów bezpieczeństwa
4. **Ograniczenie CORS**: Dostosowanie allowed origins do rzeczywistej domeny
5. **Strengthening Rate Limiting**: Dostosowanie limitów do rzeczywistego ruchu
6. **Audit logging**: Szczegółowe logowanie wszystkich operacji bezpieczeństwa

### 🔑 Zmienne środowiskowe bezpieczeństwa

**Wymagane w docker-compose.yml:**
```yaml
environment:
  # JWT Configuration
  APP_JWT_SECRET: "MIkolajKrawczakJWTSecretKey2025SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny"
  
  # Security Filters
  APP_SECURITY_ANTI_POSTMAN_ENABLED: "false"
  
  # Rate Limiting (tylko user-service)
  APP_SECURITY_RATE_LIMIT_ENABLED: "true"
  APP_SECURITY_RATE_LIMIT_MAX_REQUESTS: "50"
  APP_SECURITY_RATE_LIMIT_WINDOW_SIZE: "60000"
```

## Dokumentacja API

### User Service API

#### Endpointy autoryzacji
| Metoda | Endpoint                | Opis                          | Parametry                | Wymagane uprawnienia |
|--------|-------------------------|------------------------------ |--------------------------|----------------------|
| POST   | /api/auth/register      | Rejestracja nowego użytkownika| username, email, password| Brak                 |
| POST   | /api/auth/login         | Logowanie użytkownika         | username, password       | Brak                 |
| POST   | /api/auth/refresh-token | Odświeżenie tokenu JWT        | refreshToken             | Brak                 |
| POST   | /api/auth/logout        | Wylogowanie użytkownika       | refreshToken             | Użytkownik           |

#### Endpointy użytkowników
| Metoda | Endpoint                | Opis                           | Parametry                              | Wymagane uprawnienia |
|--------|-------------------------|--------------------------------|----------------------------------------|----------------------|
| GET    | /api/users/me           | Pobieranie danych użytkownika  | -                                      | Użytkownik           |
| PUT    | /api/users/me           | Aktualizacja danych użytkownika| email, password, firstName, lastName   | Użytkownik           |
| GET    | /api/users/{id}         | Pobieranie użytkownika po ID   | id (ścieżka)                          | Admin                |
| GET    | /api/users              | Pobieranie listy użytkowników  | page, size, sort                       | Admin                |
| POST   | /api/users/usernames    | Pobieranie nazw użytkowników   | userIds (lista)                        | Brak                 |
| PUT    | /api/users/{id}/role    | Zmiana roli użytkownika        | id (ścieżka), roles                    | Admin                |
| DELETE | /api/users/{id}         | Usunięcie użytkownika          | id (ścieżka)                          | Admin                |

### Flashcard Service API
| Metoda | Endpoint                                          | Opis                         | Parametry                              | Wymagane uprawnienia  |
|--------|---------------------------------------------------|------------------------------|----------------------------------------|-----------------------|
| GET    | /api/decks/my                                     | Pobieranie własnych zestawów | X-User-ID (nagłówek)                   | Użytkownik            |
| GET    | /api/decks/public                                 | Pobieranie publicznych       | -                                      | Brak                  |
| GET    | /api/decks/{id}                                   | Pobieranie zestawu po ID     | id (ścieżka)                          | *                     |
| POST   | /api/decks                                        | Tworzenie zestawu            | name, description, isPublic, X-User-ID | Użytkownik            |
| PUT    | /api/decks/{id}                                   | Aktualizacja zestawu         | id, name, description, isPublic, X-User-ID | Właściciel        |
| DELETE | /api/decks/{id}                                   | Usunięcie zestawu            | id (ścieżka), X-User-ID                | Właściciel            |
| POST   | /api/decks/{id}/import/csv                        | Import z CSV                 | id, file (multipart), X-User-ID        | Właściciel            |
| POST   | /api/decks/{id}/import/txt                        | Import z TXT                 | id, file (multipart), X-User-ID        | Właściciel            |

*Dostęp do prywatnych zestawów tylko dla właściciela

### Quiz Service API
| Metoda | Endpoint                                       | Opis                         | Parametry                              | Wymagane uprawnienia  |
|--------|------------------------------------------------|------------------------------|----------------------------------------|-----------------------|
| POST   | /api/quizzes                                   | Tworzenie quizu              | request (DTO), X-User-ID               | Użytkownik            |
| GET    | /api/quizzes                                   | Pobieranie quizów            | X-User-ID                              | Użytkownik            |
| GET    | /api/quizzes/my                                | Pobieranie własnych quizów   | X-User-ID                              | Użytkownik            |
| GET    | /api/quizzes/{quizId}                          | Pobieranie quizu po ID       | quizId (ścieżka), X-User-ID            | *                     |
| GET    | /api/quizzes/{quizId}/questions                | Pobieranie pytań quizu       | quizId (ścieżka), X-User-ID            | *                     |
| POST   | /api/quizzes/results                           | Zapisywanie wyniku           | request (DTO), X-User-ID               | Użytkownik            |
| GET    | /api/quizzes/{quizId}/results                  | Pobieranie wyników quizu     | quizId (ścieżka), X-User-ID            | Użytkownik            |
| GET    | /api/quizzes/{quizId}/all-results              | Pobieranie wszystkich wyników| quizId (ścieżka), X-User-ID            | Właściciel            |
| DELETE | /api/quizzes/{quizId}                          | Usunięcie quizu              | quizId (ścieżka), X-User-ID            | Właściciel            |
| PATCH  | /api/quizzes/{quizId}/public                   | Zmiana statusu publicznego   | quizId (ścieżka), isPublic, X-User-ID  | Właściciel            |

*Dostęp do prywatnych quizów tylko dla właściciela

### Statistics Service API
| Metoda | Endpoint                                       | Opis                         | Parametry                              | Wymagane uprawnienia  |
|--------|------------------------------------------------|------------------------------|----------------------------------------|-----------------------|
| POST   | /api/statistics/results                        | Zapisywanie wyniku           | request (DTO), X-User-ID               | Użytkownik            |
| GET    | /api/statistics/quizzes/{quizId}/results       | Pobieranie wyników quizu     | quizId (ścieżka), X-User-ID            | Użytkownik            |
| GET    | /api/statistics/quizzes/{quizId}/all-results   | Pobieranie wszystkich wyników| quizId (ścieżka), X-User-ID (opcjonalny)| Dostęp publiczny     |
| GET    | /api/statistics/users/results                  | Pobieranie wyników użytkownika| X-User-ID                             | Użytkownik            |
| GET    | /api/statistics/health                         | Status serwisu               | -                                      | Brak                  |

## Dockeryzacja

Cała aplikacja jest skonteneryzowana przy użyciu Dockera i Docker Compose:

### Kontenery
- **postgres**: Baza danych PostgreSQL 14 Alpine
- **user-service**: Mikroserwis zarządzania użytkownikami 
- **flashcard-service**: Mikroserwis zarządzania fiszkami 
- **quiz-service**: Mikroserwis zarządzania quizami
- **statistics-service**: Mikroserwis zarządzania statystykami
- **frontend**: Aplikacja React

### Konfiguracja Docker Compose

Projekt używa Docker Compose do zarządzania wszystkimi kontenerami. Główne elementy konfiguracji:

```yaml
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: quizapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-schema.sql:/docker-entrypoint-initdb.d/init-schema.sql
    networks:
      - quizapp-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  user-service:
    build: ./user-service
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/quizapp
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - quizapp-network

  # Podobna konfiguracja dla innych mikroserwisów

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_USER_SERVICE_URL=http://user-service:8080
      - REACT_APP_FLASHCARD_SERVICE_URL=http://flashcard-service:8081
      - REACT_APP_QUIZ_SERVICE_URL=http://quiz-service:8083
      - REACT_APP_STATISTICS_SERVICE_URL=http://statistics-service:8084
    networks:
      - quizapp-network

networks:
  quizapp-network:
    driver: bridge

volumes:
  postgres-data:
  flashcard-uploads:
```

### Obrazy Docker

Każdy mikroserwis ma swój własny Dockerfile, np. dla `user-service`:

```dockerfile
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY /src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Uruchomienie projektu

### Wymagania
- Docker i Docker Compose
- Java 17+ (tylko do rozwoju)
- Maven 3.8+ (tylko do rozwoju)
- Node.js i npm (tylko do rozwoju)

### Kroki uruchomienia

1. **Sklonuj repozytorium**
   ```bash
   git clone https://github.com/twoj-username/quizapp.git
   cd quizapp
   ```

2. **Uruchom kontenery za pomocą Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Aplikacja będzie dostępna pod adresami:**
   - Frontend: http://localhost:3000
   - User Service API: http://localhost:8080
   - Flashcard Service API: http://localhost:8081
   - Quiz Service API: http://localhost:8083
   - Statistics Service API: http://localhost:8084

## Dokumentacja dodatkowa

### 📋 Dostępna dokumentacja

- **[Szczegółowa dokumentacja bezpieczeństwa](docs/SECURITY.md)** - Kompleksowy przewodnik po wszystkich aspektach bezpieczeństwa QuizApp
- **[Szablon konfiguracji bezpieczeństwa](docs/security-config-template.properties)** - Przykładowa konfiguracja wszystkich ustawień bezpieczeństwa
- **[API Documentation](docs/api/)** - Szczegółowa dokumentacja wszystkich endpointów API (planowane)
- **[Deployment Guide](docs/deployment/)** - Przewodnik wdrażania na różnych środowiskach (planowane)

### 🔐 Bezpieczeństwo - szybki start

**Aktualna konfiguracja bezpieczeństwa (development):**
- ✅ JWT Authentication - włączone
- ✅ CORS - skonfigurowane dla localhost:3000
- ✅ Rate Limiting - włączone (50 req/min)
- ❌ AntiPostmanFilter - wyłączone
- ✅ BCrypt password hashing - włączone
- ✅ Security Headers - automatycznie dodawane przez frontend

**Szybka diagnoza problemów bezpieczeństwa:**
```bash
# Sprawdź czy wszystkie serwisy mają JWT secret
docker compose exec user-service env | grep JWT
docker compose exec quiz-service env | grep JWT

# Sprawdź logi bezpieczeństwa
docker compose logs user-service | grep -i security
docker compose logs quiz-service | grep -i jwt

# Test autoryzacji
curl -H "Authorization: Bearer <your-token>" \
     -H "X-User-ID: 1" \
     http://localhost:8080/api/users/me
```

Więcej informacji w [docs/SECURITY.md](docs/SECURITY.md).

### 🐛 Troubleshooting

**Najczęstsze problemy:**

1. **403 Forbidden errors** → Sprawdź czy AntiPostmanFilter jest wyłączony
2. **JWT signature errors** → Upewnij się że wszystkie serwisy mają ten sam APP_JWT_SECRET
3. **CORS errors** → Sprawdź konfigurację allowed origins
4. **Rate limiting** → Sprawdź limity w user-service

Szczegółowe rozwiązania w [dokumentacji bezpieczeństwa](docs/SECURITY.md#troubleshooting).
