# API Endpoints - Szczegółowa Dokumentacja

## 📋 Kompletna Lista Wszystkich Endpointów

### 🔐 User Service (Port 8080) - 23 endpointy

**Authentication & Authorization:**
- `POST /api/auth/register` - Rejestracja nowego użytkownika
- `POST /api/auth/login` - Logowanie użytkownika  
- `POST /api/auth/refresh-token` - Odświeżanie tokenu dostępu
- `POST /api/auth/logout` - Wylogowanie użytkownika

**User Management:**
- `GET /api/users/me` - Profil zalogowanego użytkownika
- `PUT /api/users/me` - Aktualizacja profilu zalogowanego użytkownika
- `GET /api/users/{id}` - Profil użytkownika po ID (ADMIN)
- `GET /api/users` - Lista wszystkich użytkowników (ADMIN)
- `GET /api/users/search` - Wyszukiwanie użytkowników (ADMIN)
- `POST /api/users/usernames` - Pobieranie nazw użytkowników po ID
- `GET /api/users/{id}/is-admin` - Sprawdzenie czy użytkownik jest adminem
- `PUT /api/users/{id}/role` - Zmiana roli użytkownika (ADMIN)
- `DELETE /api/users/{id}` - Usuwanie użytkownika (ADMIN)

**Group Management:**
- `GET /api/groups` - Lista wszystkich grup
- `POST /api/groups` - Tworzenie nowej grupy (ADMIN)
- `GET /api/groups/{id}` - Szczegóły konkretnej grupy
- `GET /api/groups/name/{name}` - Grupa po nazwie
- `PUT /api/groups/{id}` - Aktualizacja grupy (ADMIN)
- `DELETE /api/groups/{id}` - Usuwanie grupy (ADMIN)
- `POST /api/groups/{groupId}/members/{userId}` - Dodawanie członka do grupy (ADMIN)
- `DELETE /api/groups/{groupId}/members/{userId}` - Usuwanie członka z grupy (ADMIN)
- `GET /api/groups/my-groups` - Moje grupy
- `GET /api/groups/{id}/members` - Lista członków grupy

### 📚 Flashcard Service (Port 8081) - 14 endpointów

**Flashcard Deck Management:**
- `GET /api/decks/my` - Moje zestawy fiszek
- `GET /api/decks/public` - Publiczne zestawy fiszek
- `GET /api/decks/{id}` - Szczegóły zestawu fiszek
- `POST /api/decks` - Tworzenie nowego zestawu fiszek
- `PUT /api/decks/{id}` - Aktualizacja zestawu fiszek
- `DELETE /api/decks/{id}` - Usuwanie zestawu fiszek
- `POST /api/decks/{id}/import/csv` - Import fiszek z CSV
- `POST /api/decks/{id}/import/txt` - Import fiszek z TXT

**Flashcard Management:**
- `GET /api/flashcards/deck/{deckId}` - Lista fiszek w zestawie
- `GET /api/flashcards/{id}` - Szczegóły fiszki
- `POST /api/flashcards` - Dodawanie fiszki do zestawu
- `PUT /api/flashcards/{id}` - Aktualizacja fiszki
- `DELETE /api/flashcards/{id}` - Usuwanie fiszki
- `POST /api/flashcards/upload-image` - Upload obrazu dla fiszki

### 🧠 Quiz Service (Port 8083) - 19 endpointów

**Quiz Management:**
- `POST /api/quizzes` - Tworzenie nowego quizu
- `GET /api/quizzes` - Lista wszystkich quizów
- `POST /api/quizzes/available` - Dostępne quizy dla użytkownika
- `GET /api/quizzes/my` - Moje quizy
- `GET /api/quizzes/{quizId}` - Szczegóły quizu
- `POST /api/quizzes/{quizId}/with-groups` - Quiz z dostępem grupowym
- `PUT /api/quizzes/{quizId}` - Aktualizacja quizu
- `DELETE /api/quizzes/{quizId}` - Usuwanie quizu
- `PATCH /api/quizzes/{quizId}/public` - Zmiana statusu publicznego quizu
- `GET /api/quizzes/group/{groupId}` - Quizy grupy

**Quiz Questions & Groups:**
- `GET /api/quizzes/{quizId}/questions` - Lista pytań w quizie
- `POST /api/quizzes/{quizId}/questions/with-groups` - Pytania z dostępem grupowym
- `POST /api/quizzes/{quizId}/groups` - Dodawanie grup do quizu
- `DELETE /api/quizzes/{quizId}/groups` - Usuwanie grup z quizu

**Quiz Results:**
- `POST /api/quizzes/results` - Zapisywanie wyników quizu
- `GET /api/quizzes/{quizId}/results` - Wyniki konkretnego quizu
- `GET /api/quizzes/{quizId}/all-results` - Wszystkie wyniki quizu

**Internal API:**
- `POST /internal/quizzes/{quizId}/check-access` - Sprawdzenie dostępu do quizu
- `GET /internal/quizzes/{quizId}/owner/{userId}` - Sprawdzenie właściciela quizu

### 📊 Statistics Service (Port 8084) - 5 endpointów

**Quiz Statistics:**
- `POST /api/statistics/results` - Zapisywanie statystyk ukończonego quizu
- `GET /api/statistics/quizzes/{quizId}/results` - Statystyki quizu dla użytkownika
- `GET /api/statistics/quizzes/{quizId}/all-results` - Wszystkie statystyki quizu
- `GET /api/statistics/users/results` - Wszystkie statystyki użytkownika
- `GET /api/statistics/health` - Status serwisu

**Łącznie: 61 endpointów REST API**

---

## 📚 Przegląd Wszystkich Endpointów

### 🔗 Porty Serwisów
- **User Service**: `http://localhost:8080`
- **Flashcard Service**: `http://localhost:8081` 
- **Quiz Service**: `http://localhost:8083`
- **Statistics Service**: `http://localhost:8084`

---

## 🔐 User Service API (Port 8080)

### Authentication Endpoints

#### POST `/api/auth/register`
**Opis**: Rejestracja nowego użytkownika w systemie

**Request Body**:
```json
{
  "username": "string (3-50 znaków, unique)",
  "email": "string (email format, unique)",
  "password": "string (min 8 znaków, 1 duża, 1 mała, 1 cyfra)",
  "firstName": "string (max 50 znaków)",
  "lastName": "string (max 50 znaków)"
}
```

**Response 200**:
```json
{
  "message": "User registered successfully!"
}
```

**Response 400** (username zajęty):
```json
{
  "message": "Error: Username is already taken!"
}
```

---

#### POST `/api/auth/login`
**Opis**: Logowanie użytkownika

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "roles": ["ROLE_ADMIN"],
  "tokenType": "Bearer",
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

#### POST `/api/auth/refresh-token`
**Opis**: Odświeżanie tokenu dostępu

**Request Body**:
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 200**:
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440001",
  "tokenType": "Bearer"
}
```

---

### User Management Endpoints

#### GET `/api/users/me`
**Opis**: Pobieranie profilu zalogowanego użytkownika

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response 200**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "firstName": "Admin",
  "lastName": "User",
  "roles": [
    {
      "id": 1,
      "name": "ROLE_ADMIN"
    }
  ],
  "groups": [
    {
      "id": 1,
      "name": "Administratorzy"
    }
  ],
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

---

#### GET `/api/users?page=0&size=10&sort=id`
**Opis**: Lista użytkowników (tylko ADMIN)

**Query Parameters**:
- `page`: numer strony (default: 0)
- `size`: rozmiar strony (default: 10)
- `sort`: pole sortowania (default: id)

**Response 200**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com", 
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["ROLE_ADMIN"],
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

#### POST `/api/users/usernames`
**Opis**: Pobieranie nazw użytkowników po ID (publiczny endpoint)

**Request Body**:
```json
[1, 2, 3, 4, 5]
```

**Response 200**:
```json
{
  "1": "admin",
  "2": "user1", 
  "3": "student1",
  "4": "user1",
  "5": "student2"
}
```

---

### Group Management Endpoints

#### GET `/api/groups`
**Opis**: Lista wszystkich grup

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "Administratorzy",
    "description": "Grupa administratorów systemu",
    "createdBy": 1,
    "memberCount": 2,
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

#### POST `/api/groups`
**Opis**: Tworzenie nowej grupy (tylko ADMIN)

**Request Body**:
```json
{
  "name": "Klasa 3A",
  "description": "Uczniowie klasy 3A"
}
```

**Response 200**:
```json
{
  "id": 2,
  "name": "Klasa 3A",
  "description": "Uczniowie klasy 3A",
  "createdBy": 1,
  "memberCount": 0,
  "createdAt": "2024-01-01T11:00:00Z"
}
```

---

## 📚 Flashcard Service API (Port 8081)

### Deck Management Endpoints

#### GET `/api/decks/my`
**Opis**: Pobieranie własnych zestawów fiszek

**Headers**:
```
X-User-ID: 1
```

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "Angielski - Podstawy",
    "description": "Podstawowe słówka angielskie",
    "userId": 1,
    "isPublic": true,
    "flashcardCount": 25,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
]
```

---

#### POST `/api/decks`
**Opis**: Tworzenie nowego zestawu fiszek

**Headers**:
```
X-User-ID: 1
```

**Request Body**:
```json
{
  "name": "Hiszpański - Podstawy",
  "description": "Podstawowe słówka hiszpańskie", 
  "isPublic": false
}
```

**Response 201**:
```json
{
  "id": 2,
  "name": "Hiszpański - Podstawy",
  "description": "Podstawowe słówka hiszpańskie",
  "userId": 1,
  "isPublic": false,
  "flashcardCount": 0,
  "createdAt": "2024-01-01T11:00:00Z",
  "updatedAt": "2024-01-01T11:00:00Z"
}
```

---

#### POST `/api/decks/{id}/import/csv`
**Opis**: Import fiszek z pliku CSV

**Headers**:
```
X-User-ID: 1
Content-Type: multipart/form-data
```

**Request Body**:
```
file: flashcards.csv
```

**Format pliku CSV**:
```text
term,definition
apple,jabłko
car,samochód
book,książka
```

**Response 200**:
```json
{
  "message": "Imported 3 flashcards successfully",
  "imported": 3,
  "skipped": 0
}
```

---

### Flashcard Management Endpoints

#### GET `/api/flashcards/deck/{deckId}`
**Opis**: Pobieranie fiszek z zestawu

**Response 200**:
```json
[
  {
    "id": 1,
    "term": "apple",
    "definition": "jabłko",
    "imagePath": "/uploads/apple.jpg",
    "deckId": 1,
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

---

#### POST `/api/flashcards`
**Opis**: Tworzenie nowej fiszki

**Request Body**:
```json
{
  "term": "orange",
  "definition": "pomarańcza",
  "deckId": 1,
  "imagePath": null
}
```

**Response 201**:
```json
{
  "id": 2,
  "term": "orange", 
  "definition": "pomarańcza",
  "imagePath": null,
  "deckId": 1,
  "createdAt": "2024-01-01T11:00:00Z"
}
```

---

## 🧠 Quiz Service API (Port 8083)

### Quiz Management Endpoints

#### POST `/api/quizzes`
**Opis**: Tworzenie nowego quizu

**Headers**:
```
X-User-ID: 1
```

**Request Body**:
```json
{
  "name": "Quiz z Matematyki",
  "description": "Test z podstaw matematyki",
  "isPublic": true,
  "groupIds": [1, 2],
  "questions": [
    {
      "questionText": "Ile to 2 + 2?",
      "questionType": "MULTIPLE_CHOICE",
      "correctAnswer": "4",
      "optionA": "3",
      "optionB": "4", 
      "optionC": "5",
      "optionD": "6",
      "points": 1
    },
    {
      "questionText": "Czy 5 > 3?",
      "questionType": "TRUE_FALSE",
      "correctAnswer": "true",
      "points": 1
    }
  ]
}
```

**Response 201**:
```json
{
  "id": 1,
  "name": "Quiz z Matematyki",
  "description": "Test z podstaw matematyki",
  "userId": 1,
  "isPublic": true,
  "questionCount": 2,
  "groupIds": [1, 2],
  "createdAt": "2024-01-01T10:00:00Z"
}
```

---

#### GET `/api/quizzes/my`
**Opis**: Pobieranie własnych quizów

**Headers**:
```
X-User-ID: 1
```