# QuizApp - Kompleksowa Dokumentacja Systemu

## 📋 Spis Treści

1. [Przegląd Systemu](#przegląd-systemu)
2. [Architektura Mikroserwisów](#architektura-mikroserwisów)
3. [API Reference - Wszystkie Endpointy](#api-reference---wszystkie-endpointy)
4. [Struktura Bazy Danych](#struktura-bazy-danych)
5. [Zabezpieczenia](#zabezpieczenia)
6. [Instalacja i Uruchomienie](#instalacja-i-uruchomienie)

---

## 🎯 Przegląd Systemu

QuizApp to nowoczesna platforma edukacyjna zbudowana w architekturze mikroserwisów, umożliwiająca:

- **Zarządzanie użytkownikami** z systemem ról i grup
- **Tworzenie i rozwiązywanie quizów** edukacyjnych
- **Zarządzanie fiszkami** (flashcards) z importem z plików
- **Analiza postępów** poprzez zaawansowane statystyki
- **Bezpieczna komunikacja** z tokenami JWT

### 🛠 Stack Technologiczny

**Backend:**
- Java 17 + Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL 14

**Frontend:**
- React 18 + TypeScript
- Bootstrap 5
- Chart.js (statystyki)
- Axios (HTTP client)

**Infrastruktura:**
- Docker + Docker Compose
- Nginx (w przyszłości)

---

## 🏗 Architektura Mikroserwisów

### Komponenty Systemu

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │ Flashcard Svc   │    │  Quiz Service   │
│    Port: 8080   │    │   Port: 8081    │    │   Port: 8083    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ Statistics Svc  │              │
         │              │   Port: 8084    │              │
         │              └─────────────────┘              │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Port: 5432    │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │     React       │
                    │   Port: 3000    │
                    └─────────────────┘
```

### 1. 👤 User Service (Port 8080)

**Odpowiedzialności:**
- Rejestracja i uwierzytelnianie użytkowników
- Zarządzanie rolami (USER, ADMIN)
- Zarządzanie grupami użytkowników
- Wydawanie i walidacja tokenów JWT
- Refresh tokeny

**Kluczowe Komponenty:**
- `JwtTokenProvider` - generator tokenów JWT
- `JwtAuthenticationFilter` - filtr uwierzytelniania
- `AntiPostmanFilter` - ochrona przed automatycznymi narzędziami
- `RateLimitingFilter` - ograniczenia częstotliwości żądań

### 2. 📚 Flashcard Service (Port 8081)

**Odpowiedzialności:**
- Tworzenie i zarządzanie zestawami fiszek
- Import fiszek z plików CSV/TXT
- Udostępnianie zestawów publicznie
- Upload obrazów do fiszek

**Funkcje Specjalne:**
- Parser CSV z obsługą separatorów: `,`, `;`, `|`
- Parser TXT z formatem: `termin :: definicja`
- Walidacja rozszerzenia plików obrazów

### 3. 🧠 Quiz Service (Port 8083)

**Odpowiedzialności:**
- Tworzenie quizów z różnymi typami pytań
- Zarządzanie pytaniami wielokrotnego wyboru
- Rozwiązywanie quizów i ocenianie
- Autoryzacja dostępu do quizów (publiczne/grupowe)

**Typy Pytań:**
- Wielokrotny wybór (MULTIPLE_CHOICE)
- Otwarte (OPEN_ENDED)

### 4. 📊 Statistics Service (Port 8084)

**Odpowiedzialności:**
- Zbieranie wyników quizów
- Generowanie statystyk użytkownika
- Analiza postępów w nauce
- Ranking użytkowników

**Metryki:**
- Średnie wyniki z quizów
- Liczba rozwiązanych quizów
- Postęp w czasie
- Porównania między użytkownikami

### 5. 🌐 Frontend (Port 3000)

**Komponenty React:**
- Dashboard z przeglądem aktywności
- QuizCreator - kreator quizów
- FlashcardDeckEditor - edytor fiszek
- StatisticsViewer - wizualizacja wyników
- UserManagement - zarządzanie użytkownikami

---

## 🚀 API Reference - Wszystkie Endpointy

### 🔐 User Service API (Port 8080)

#### Uwierzytelnianie
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| POST | `/api/auth/register` | Rejestracja użytkownika | `username`, `email`, `password`, `firstName`, `lastName` | Brak |
| POST | `/api/auth/login` | Logowanie | `username`, `password` | Brak |
| POST | `/api/auth/refresh-token` | Odświeżanie tokenu | `refreshToken` | Brak |
| POST | `/api/auth/logout` | Wylogowanie | `refreshToken` | Brak |

#### Zarządzanie Użytkownikami
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| GET | `/api/users/me` | Profil zalogowanego użytkownika | - | USER/ADMIN |
| PUT | `/api/users/me` | Aktualizacja profilu | `firstName`, `lastName`, `email` | USER/ADMIN |
| GET | `/api/users/{id}` | Pobieranie użytkownika po ID | `id` (path) | ADMIN |
| GET | `/api/users` | Lista użytkowników | `page`, `size`, `sort` | ADMIN |
| GET | `/api/users/search` | Wyszukiwanie użytkowników | `query` | ADMIN |
| POST | `/api/users/usernames` | Pobieranie nazw użytkowników | `userIds[]` | Brak |
| GET | `/api/users/{id}/is-admin` | Sprawdzenie czy admin | `id` (path) | Brak |
| PUT | `/api/users/{id}/role` | Zmiana roli użytkownika | `id` (path), `roles[]` | ADMIN |
| DELETE | `/api/users/{id}` | Usunięcie użytkownika | `id` (path) | ADMIN |

#### Zarządzanie Grupami
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| GET | `/api/groups` | Lista wszystkich grup | - | USER/ADMIN |
| GET | `/api/groups/{id}` | Grupa po ID | `id` (path) | USER/ADMIN |
| GET | `/api/groups/name/{name}` | Grupa po nazwie | `name` (path) | USER/ADMIN |
| POST | `/api/groups` | Tworzenie grupy | `name`, `description` | ADMIN |
| PUT | `/api/groups/{id}` | Aktualizacja grupy | `id` (path), `name`, `description` | ADMIN |
| DELETE | `/api/groups/{id}` | Usunięcie grupy | `id` (path) | ADMIN |
| POST | `/api/groups/{id}/members/{userId}` | Dodanie członka | `id`, `userId` (path) | ADMIN |
| DELETE | `/api/groups/{id}/members/{userId}` | Usunięcie członka | `id`, `userId` (path) | ADMIN |

### 📚 Flashcard Service API (Port 8081)

#### Zarządzanie Zestawami Fiszek
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| GET | `/api/decks/my` | Moje zestawy fiszek | `X-User-ID` (header) | Właściciel |
| GET | `/api/decks/public` | Publiczne zestawy | - | Brak |
| GET | `/api/decks/{id}` | Zestaw po ID | `id` (path) | Właściciel/Publiczny |
| POST | `/api/decks` | Tworzenie zestawu | `name`, `description`, `isPublic`, `X-User-ID` | Właściciel |
| PUT | `/api/decks/{id}` | Aktualizacja zestawu | `id` (path), `name`, `description`, `isPublic`, `X-User-ID` | Właściciel |
| DELETE | `/api/decks/{id}` | Usunięcie zestawu | `id` (path), `X-User-ID` | Właściciel |

#### Import/Export Fiszek
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| POST | `/api/decks/{id}/import/csv` | Import z pliku CSV | `id` (path), `file` (multipart), `X-User-ID` | Właściciel |
| POST | `/api/decks/{id}/import/txt` | Import z pliku TXT | `id` (path), `file` (multipart), `X-User-ID` | Właściciel |

#### Zarządzanie Fiszkami
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| GET | `/api/flashcards/deck/{deckId}` | Fiszki z zestawu | `deckId` (path) | Właściciel/Publiczny |
| GET | `/api/flashcards/{id}` | Fiszka po ID | `id` (path) | Właściciel/Publiczny |
| POST | `/api/flashcards` | Tworzenie fiszki | `term`, `definition`, `deckId`, `imagePath` | Właściciel |
| PUT | `/api/flashcards/{id}` | Aktualizacja fiszki | `id` (path), `term`, `definition`, `imagePath` | Właściciel |
| DELETE | `/api/flashcards/{id}` | Usunięcie fiszki | `id` (path) | Właściciel |
| POST | `/api/flashcards/{id}/image` | Upload obrazu | `id` (path), `image` (multipart) | Właściciel |

### 🧠 Quiz Service API (Port 8083)

#### Zarządzanie Quizami
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| POST | `/api/quizzes` | Tworzenie quizu | `CreateQuizRequest`, `X-User-ID` | Właściciel |
| GET | `/api/quizzes` | Quizy dostępne dla użytkownika | `X-User-ID` | USER |
| POST | `/api/quizzes/available` | Quizy dostępne w grupach | `X-User-ID`, `groupIds[]` | USER |
| GET | `/api/quizzes/my` | Moje quizy | `X-User-ID` | Właściciel |
| GET | `/api/quizzes/{quizId}` | Quiz po ID | `quizId` (path), `X-User-ID` | USER |
| POST | `/api/quizzes/{quizId}/with-groups` | Quiz z weryfikacją grup | `quizId` (path), `X-User-ID`, `groupIds[]` | USER |
| DELETE | `/api/quizzes/{quizId}` | Usunięcie quizu | `quizId` (path), `X-User-ID` | Właściciel |
| PATCH | `/api/quizzes/{quizId}/public` | Zmiana statusu publicznego | `quizId` (path), `isPublic`, `X-User-ID` | Właściciel |

#### Pytania Quizu
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| GET | `/api/quizzes/{quizId}/questions` | Pytania quizu | `quizId` (path), `X-User-ID` | USER |
| POST | `/api/quizzes/{quizId}/questions/with-groups` | Pytania z weryfikacją grup | `quizId` (path), `X-User-ID`, `groupIds[]` | USER |

#### Wyniki Quizów
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| POST | `/api/quizzes/results` | Zapisywanie wyniku | `SubmitQuizResultRequest`, `X-User-ID` | USER |
| GET | `/api/quizzes/{quizId}/results` | Wyniki użytkownika | `quizId` (path), `X-User-ID` | USER |
| GET | `/api/quizzes/{quizId}/all-results` | Wszystkie wyniki quizu | `quizId` (path), `X-User-ID` | Właściciel |

#### API Wewnętrzne (Inter-service)
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| GET | `/internal/api/quizzes/{quizId}/access-check` | Sprawdzenie dostępu | `quizId` (path), `userId`, `groupIds[]` | Internal |

### 📊 Statistics Service API (Port 8084)

#### Statystyki Wyników
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| POST | `/api/statistics/results` | Zapisywanie wyniku | `SubmitQuizResultRequest`, `X-User-ID` | USER |
| GET | `/api/statistics/quizzes/{quizId}/results` | Wyniki quizu użytkownika | `quizId` (path), `X-User-ID` | USER |
| GET | `/api/statistics/quizzes/{quizId}/all-results` | Wszystkie wyniki quizu | `quizId` (path), `X-User-ID` (optional) | Publiczny |
| GET | `/api/statistics/users/results` | Wszystkie wyniki użytkownika | `X-User-ID` | USER |

#### Health Check
| Metoda | Endpoint | Opis | Parametry | Autoryzacja |
|--------|----------|------|-----------|-------------|
| GET | `/api/statistics/health` | Status serwisu | - | Brak |

---

## 🗄 Struktura Bazy Danych

### Schema Overview
```sql
-- Główne schematy
CREATE SCHEMA users;    -- User Service
CREATE SCHEMA flashcards; -- Flashcard Service  
CREATE SCHEMA quizzes;   -- Quiz Service
CREATE SCHEMA statistics; -- Statistics Service
```

### 👤 Schema: users

#### Tabela: users
```sql
CREATE TABLE users.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL, -- BCrypt hash
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: roles
```sql
CREATE TABLE users.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL -- 'USER', 'ADMIN'
);

-- Domyślne role
INSERT INTO users.roles (name) VALUES ('USER'), ('ADMIN');
```

#### Tabela: user_roles (Many-to-Many)
```sql
CREATE TABLE users.user_roles (
    user_id BIGINT REFERENCES users.users(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES users.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

#### Tabela: groups
```sql
CREATE TABLE users.groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_by BIGINT REFERENCES users.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: group_members (Many-to-Many)
```sql
CREATE TABLE users.group_members (
    group_id BIGINT REFERENCES users.groups(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);
```

#### Tabela: refresh_tokens
```sql
CREATE TABLE users.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users.users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 📚 Schema: flashcards

#### Tabela: flashcard_decks
```sql
CREATE TABLE flashcards.flashcard_decks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: flashcards
```sql
CREATE TABLE flashcards.flashcards (
    id BIGSERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    image_path VARCHAR(255), -- Ścieżka do obrazu (opcjonalnie)
    deck_id BIGINT REFERENCES flashcards.flashcard_decks(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🧠 Schema: quizzes

#### Tabela: quizzes
```sql
CREATE TABLE quizzes.quizzes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    is_public BOOLEAN DEFAULT FALSE,
    question_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: quiz_groups (Dostęp grupowy)
```sql
CREATE TABLE quizzes.quiz_groups (
    quiz_id BIGINT REFERENCES quizzes.quizzes(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL, -- Reference do users.groups(id)
    PRIMARY KEY (quiz_id, group_id)
);
```

#### Tabela: quiz_questions
```sql
CREATE TABLE quizzes.quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT REFERENCES quizzes.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL, -- 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'OPEN_ENDED'
    correct_answer TEXT NOT NULL,
    option_a VARCHAR(255), -- Dla MULTIPLE_CHOICE
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: quiz_results
```sql
CREATE TABLE quizzes.quiz_results (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT REFERENCES quizzes.quizzes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage DECIMAL(5,2) CALCULATED AS (score * 100.0 / total_questions),
    completed_at TIMESTAMP DEFAULT NOW()
);
```

### 📊 Schema: statistics

#### Tabela: quiz_statistics
```sql
CREATE TABLE statistics.quiz_statistics (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL, -- Reference do quizzes.quizzes(id)
    quiz_name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage DECIMAL(5,2) CALCULATED AS (score * 100.0 / total_questions),
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Index dla szybkich zapytań
CREATE INDEX idx_quiz_statistics_user_id ON statistics.quiz_statistics(user_id);
CREATE INDEX idx_quiz_statistics_quiz_id ON statistics.quiz_statistics(quiz_id);
CREATE INDEX idx_quiz_statistics_completed_at ON statistics.quiz_statistics(completed_at);
```

---

## 🔒 Zabezpieczenia

### 🛡 Mechanizmy Ochrony

#### 1. JWT Authentication
- **Algorytm**: HS512 (HMAC with SHA-512)
- **Klucz tajny**: 256-bitowy klucz kryptograficzny
- **Czas życia tokenu**: 24 godziny
- **Refresh token**: 7 dni

```json
{
  "sub": "1",
  "username": "admin",
  "roles": ["ADMIN"],
  "iat": 1704063600,
  "exp": 1704150000
}
```

#### 2. Anti-Postman Protection
Zaawansowany system ochrony przed automatycznymi narzędziami:

**Blokowane User-Agents:**
- `postman`, `insomnia`, `curl`, `httpie`, `wget`
- `apache-httpclient`, `okhttp`, `java/`
- `python-requests`, `go-http-client`, `nodejs`

**Wymagane nagłówki:**
```text
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
X-Requested-With: XMLHttpRequest
X-Client-Signature: <calculated_signature>
X-Timestamp: <unix_timestamp>
Origin: http://localhost:3000
```

**Algorytm podpisu klienta:**
```javascript
function generateSignature(path, timestamp) {
    const data = `${path}:${timestamp}:QuizAppSecret2024`;
    return btoa(data).slice(0, 16);
}
```

#### 3. Rate Limiting
- **Limit**: 50 żądań na minutę na IP
- **Okno czasowe**: 60 sekund
- **Wykrywanie rzeczywistego IP**: Obsługa proxy i load balancerów
- **Automatyczne czyszczenie**: Stare wpisy usuwane co minutę

#### 4. CORS Configuration
**Dozwolone originy:**
- `http://localhost:3000` (development)
- `http://127.0.0.1:3000` (alternative localhost)

**Dozwolone metody:** GET, POST, PUT, DELETE, PATCH, OPTIONS

#### 5. Input Validation
- **Bean Validation** (JSR-303)
- **SQL Injection Prevention** (JPA/Hibernate)
- **XSS Protection** poprzez sanityzację danych
- **File Upload Validation** (rozszerzenia, rozmiar)

#### 6. Password Security
```java
// Hashing z BCrypt (cost factor: 12)
String hashedPassword = bcrypt.hashpw(plainPassword, bcrypt.gensalt(12));

// Walidacja siły hasła
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$")
private String password;
```

#### 7. Database Security
- **Connection pooling** z HikariCP
- **Query timeout**: 30 sekund
- **Prepared statements** (automatycznie przez JPA)
- **Database isolation** per mikroserwis

### 🚨 Monitoring i Logging

#### Security Events Logged:
```text
# Konfiguracja logowania zabezpieczeń
logging.level.com.example.userservice.security=INFO
logging.level.org.springframework.security=DEBUG
```

**Przykładowe logi:**
```
WARN  AntiPostmanFilter - Blocked suspicious request: UserAgent=PostmanRuntime/7.32.3, IP=192.168.1.100
ERROR JwtAuthenticationFilter - Invalid JWT signature, IP=192.168.1.100
INFO  RateLimitingFilter - Rate limit applied: IP=192.168.1.100, Count=45/50
```

#### Health Monitoring:
- **Health checks** dla każdego mikroserwisu
- **Database connection monitoring**
- **JWT token validation errors tracking**

### ⚙️ Konfiguracja Zabezpieczeń

#### Konfiguracja globalna (application.yml):
```yaml
app:
  security:
    anti-postman:
      enabled: true
    rate-limit:
      enabled: true
      max-requests: 50
      window-size: 60000 # 1 minuta
    allowed-origins:
      - "http://localhost:3000"
      - "http://127.0.0.1:3000"
  jwt:
    secret: "MIkolajKrawczakJWTSecretKey2024SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny"
    expiration: 86400000 # 24 godziny
    refresh-expiration: 604800000 # 7 dni
```

#### Wyłączanie zabezpieczeń (development):
```text
app.security.anti-postman.enabled=false
app.security.rate-limit.enabled=false
```

### 🔍 Testowanie Zabezpieczeń

#### 1. Test Rate Limiting:
```bash
# Test przekroczenia limitu
for i in {1..60}; do
  curl -s http://localhost:8080/api/users/me > /dev/null
done
# 51. żądanie powinno zwrócić 429 Too Many Requests
```

#### 2. Test Anti-Postman:
```bash
# Próba użycia curl (zablokowane)
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/users/me
# Response: 403 Forbidden - Invalid client

# Symulacja przeglądarki (dozwolone)
curl -H "User-Agent: Mozilla/5.0..." \
     -H "Accept: application/json" \
     -H "X-Requested-With: XMLHttpRequest" \
     -H "Origin: http://localhost:3000" \
     http://localhost:8080/api/users/me
```

#### 3. Test JWT:
```bash
# Test z nieprawidłowym tokenem
curl -H "Authorization: Bearer invalid_token" http://localhost:8080/api/users/me
# Response: 401 Unauthorized

# Test bez tokenu
curl http://localhost:8080/api/users/me  
# Response: 401 Unauthorized
```

---

## 🚀 Instalacja i Uruchomienie

### Wymagania
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (dla rozwoju frontendu)
- Java 17+ (dla rozwoju backendu)

### Uruchomienie z Docker Compose
```bash
# Klonowanie repozytorium
git clone <repository-url>
cd QuizApp

# Uruchomienie całego systemu
docker-compose up -d

# Sprawdzenie statusu
docker-compose ps

# Logi konkretnego serwisu
docker-compose logs -f user-service
```

### Porty Serwisów
- **Frontend**: http://localhost:3000
- **User Service**: http://localhost:8080
- **Flashcard Service**: http://localhost:8081
- **Quiz Service**: http://localhost:8083
- **Statistics Service**: http://localhost:8084
- **PostgreSQL**: localhost:5432

### Domyślne Konta
```
Admin:
  username: admin
  password: admin123

User:
  username: user
  password: user123
```

### Pierwsza Konfiguracja
1. Otwórz http://localhost:3000
2. Zaloguj się kontem admin
3. Utwórz pierwszą grupę użytkowników
4. Dodaj pierwszego quiza lub zestaw fiszek
5. Sprawdź statystyki w sekcji Analytics

---

## 📝 Podsumowanie

QuizApp to kompleksowa platforma edukacyjna zbudowana według najlepszych praktyk:

✅ **Architektura mikroserwisów** - skalowalność i separation of concerns  
✅ **Zaawansowane zabezpieczenia** - JWT, Anti-automation, Rate limiting  
✅ **Nowoczesny stack** - Spring Boot 3, React 18, PostgreSQL 14  
✅ **Konteneryzacja** - łatwe wdrożenie z Docker Compose  
✅ **RESTful API** - przejrzysta komunikacja między serwisami  
✅ **Dokumentacja** - kompleksowy opis wszystkich komponentów  

System jest gotowy do produkcji i może być łatwo rozszerzany o nowe funkcjonalności. 
