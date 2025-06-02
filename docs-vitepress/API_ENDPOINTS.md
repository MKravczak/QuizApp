# API Endpoints - Szczegółowa Dokumentacja

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
  "roles": ["ADMIN"],
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
      "name": "ADMIN"
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
    "roles": ["ADMIN"],
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

**Response 200**:
```json
[
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
]
```

---

#### GET `/api/quizzes/{quizId}/questions`
**Opis**: Pobieranie pytań quizu

**Headers**:
```
X-User-ID: 1
```

**Response 200**:
```json
[
  {
    "id": 1,
    "questionText": "Ile to 2 + 2?",
    "questionType": "MULTIPLE_CHOICE",
    "optionA": "3",
    "optionB": "4",
    "optionC": "5", 
    "optionD": "6",
    "points": 1
  },
  {
    "id": 2,
    "questionText": "Czy 5 > 3?",
    "questionType": "TRUE_FALSE",
    "points": 1
  }
]
```

---

### Quiz Results Endpoints

#### POST `/api/quizzes/results`
**Opis**: Zapisywanie wyniku quizu

**Headers**:
```
X-User-ID: 1
```

**Request Body**:
```json
{
  "quizId": 1,
  "quizName": "Quiz z Matematyki",
  "score": 2,
  "totalQuestions": 2,
  "answers": [
    {
      "questionId": 1,
      "userAnswer": "4",
      "isCorrect": true,
      "points": 1
    },
    {
      "questionId": 2,
      "userAnswer": "true",
      "isCorrect": true,
      "points": 1
    }
  ]
}
```

**Response 201**:
```json
{
  "id": 1,
  "quizId": 1,
  "userId": 1,
  "score": 2,
  "totalQuestions": 2,
  "percentage": 100.0,
  "completedAt": "2024-01-01T12:00:00Z"
}
```

---

## 📊 Statistics Service API (Port 8084)

### Statistics Endpoints

#### GET `/api/statistics/users/results`
**Opis**: Pobieranie wszystkich wyników użytkownika

**Headers**:
```
X-User-ID: 1
```

**Response 200**:
```json
[
  {
    "id": 1,
    "quizId": 1,
    "quizName": "Quiz z Matematyki",
    "userId": 1,
    "score": 2,
    "totalQuestions": 2,
    "percentage": 100.0,
    "completedAt": "2024-01-01T12:00:00Z"
  }
]
```

---

#### GET `/api/statistics/quizzes/{quizId}/all-results`
**Opis**: Wszystkie wyniki konkretnego quizu

**Response 200**:
```json
[
  {
    "id": 1,
    "quizId": 1,
    "quizName": "Quiz z Matematyki", 
    "userId": 1,
    "score": 2,
    "totalQuestions": 2,
    "percentage": 100.0,
    "completedAt": "2024-01-01T12:00:00Z"
  },
  {
    "id": 2,
    "quizId": 1,
    "quizName": "Quiz z Matematyki",
    "userId": 2,
    "score": 1,
    "totalQuestions": 2,
    "percentage": 50.0,
    "completedAt": "2024-01-01T13:00:00Z"
  }
]
```

---

## 🔒 Security Headers

### Wymagane nagłówki dla wszystkich chronionych endpointów:

```text
Authorization: Bearer <access_token>
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
X-Requested-With: XMLHttpRequest
X-Client-Signature: <calculated_signature>
X-Timestamp: <unix_timestamp>
Origin: http://localhost:3000
User-Agent: Mozilla/5.0 (compatible browser)
```

### Endpointy wymagające X-User-ID:
- Wszystkie endpointy w Flashcard Service
- Wszystkie endpointy w Quiz Service (oprócz `/internal/*`)
- Wszystkie endpointy w Statistics Service

---

## 📋 HTTP Status Codes

| Code | Znaczenie | Przykład użycia |
|------|-----------|----------------|
| 200 | OK | Sukces operacji GET/PUT |
| 201 | Created | Sukces operacji POST |
| 204 | No Content | Sukces operacji DELETE |
| 400 | Bad Request | Błędne dane wejściowe |
| 401 | Unauthorized | Brak/nieprawidłowy token |
| 403 | Forbidden | Brak uprawnień/Anti-Postman |
| 404 | Not Found | Zasób nie istnieje |
| 409 | Conflict | Konflikt danych (np. username zajęty) |
| 429 | Too Many Requests | Rate limiting |
| 500 | Internal Server Error | Błąd serwera |

---

## 🧪 Przykłady Testowania API

### Curl z prawidłowymi nagłówkami:
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -H "Accept: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Origin: http://localhost:3000" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

### JavaScript Fetch Example:
```javascript
const response = await fetch('http://localhost:8080/api/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
});
const user = await response.json();
``` 
