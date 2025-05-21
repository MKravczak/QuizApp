# QuizApp - Platforma Edukacyjna z Quizami i Fiszkami

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

System wykorzystuje wielopoziomowe zabezpieczenia:

### Autentykacja
- **JWT (JSON Web Tokens)**: Bezstanowa autentykacja użytkowników
- **Spring Security**: Filtrowanie żądań, autoryzacja
- **Odświeżanie tokenów**: Mechanizm bezpiecznej wymiany wygasłych tokenów

### Autoryzacja
- **Role systemowe**: ADMIN, USER
- **Walidacja właściciela zasobów**: Weryfikacja czy użytkownik jest właścicielem zasobu

### Bezpieczeństwo danych
- **Hashowanie haseł**: Bezpieczne przechowywanie haseł użytkowników
- **Walidacja danych**: Szczegółowa walidacja danych wejściowych
- **CORS**: Konfiguracja nagłówków bezpieczeństwa

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
