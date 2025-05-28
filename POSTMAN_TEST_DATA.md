# Dane testowe do sprawdzenia zabezpieczeń w Postman

## ⚠️ Te żądania POWINNY być zablokowane przez system bezpieczeństwa!

### 1. Test podstawowy - Pobranie listy użytkowników
```
GET http://localhost:8080/api/users
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MDYzNjAwLCJleHAiOjE3MDQxNTAwMDB9
```
**Oczekiwany wynik**: 403 Forbidden - Invalid client

### 2. Test z próbą obejścia User-Agent
```
GET http://localhost:8080/api/users/me
User-Agent: Mozilla/5.0 (compatible; MyApp/1.0)
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MDYzNjAwLCJleHAiOjE3MDQxNTAwMDB9
```
**Oczekiwany wynik**: 403 Forbidden - Missing required headers

### 3. Test Quiz Service - Pobranie quizów
```
GET http://localhost:8083/api/quizzes
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MDYzNjAwLCJleHAiOjE3MDQxNTAwMDB9
X-User-ID: 1
```
**Oczekiwany wynik**: 403 Forbidden - Invalid client

### 4. Test Flashcard Service - Pobranie talii
```
GET http://localhost:8081/api/decks/my
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MDYzNjAwLCJleHAiOjE3MDQxNTAwMDB9
X-User-ID: 1
```
**Oczekiwany wynik**: 403 Forbidden - Invalid client

### 5. Test z próbą dodania nagłówków przeglądarki
```
GET http://localhost:8080/api/users/me
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: application/json
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MDYzNjAwLCJleHAiOjE3MDQxNTAwMDB9
```
**Oczekiwany wynik**: 403 Forbidden - Missing security token (brak X-Requested-With)

### 6. Test z wszystkimi nagłówkami ale błędnym podpisem
```
GET http://localhost:8080/api/users/me
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: application/json
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
X-Requested-With: XMLHttpRequest
X-Client-Signature: niepoprawny-podpis
X-Timestamp: 1704063600000
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MDYzNjAwLCJleHAiOjE3MDQxNTAwMDB9
```
**Oczekiwany wynik**: 403 Forbidden - Invalid client signature

### 7. Test Rate Limiting - Wyślij 60 żądań szybko
```
GET http://localhost:8080/api/test/public
```
**Oczekiwany wynik**: Po 50 żądaniach: 429 Too Many Requests

### 8. Test SQL Injection na endpointach auth (dozwolone ale bezpieczne)
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
    "email": "admin@example.com' OR '1'='1",
    "password": "password' OR '1'='1"
}
```
**Oczekiwany wynik**: 401 Unauthorized (poprawne odrzucenie logowania)

### 9. Test z curl (Command Line)
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." http://localhost:8080/api/users/me
```
**Oczekiwany wynik**: 403 Forbidden - Invalid client

### 10. Test endpointów wrażliwych
```
GET http://localhost:8080/api/users
GET http://localhost:8083/api/quizzes/1
GET http://localhost:8081/api/decks/1
DELETE http://localhost:8083/api/quizzes/1
PUT http://localhost:8080/api/users/me
```
**Wszystkie powinny zwrócić**: 403 Forbidden

## 🔓 Endpointy które POWINNY działać w Postman:

### 1. Logowanie (wyłączone z filtrowania)
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "testpassword"
}
```

### 2. Rejestracja (wyłączona z filtrowania)
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpassword"
}
```

### 3. Health Check endpoints
```
GET http://localhost:8080/health
GET http://localhost:8083/health
GET http://localhost:8081/health
```

## 🔧 Klucze zabezpieczeń (dla referencji):

- **JWT Secret**: `MIkolajKrawczakJWTSecretKey2024SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny`
- **Client Secret**: `MIkolajKrawczakClientSecret2024AntiPostmanProtectionAdvancedSecurity`

## 📝 Instrukcje testowania:

1. **Import** te żądania do Postman
2. **Uruchom serwisy** aplikacji
3. **Przetestuj każde żądanie** - wszystkie oprócz auth endpoints powinny zwrócić 403
4. **Sprawdź logi** serwisów - powinny zawierać ostrzeżenia o zablokowanych żądaniach
5. **Sprawdź rate limiting** - wyślij 60 żądań na `/api/test/public`

## 🎯 Poprawny sposób użycia:

Jedynym sposobem na dostęp do API jest użycie **aplikacji frontend** uruchomionej w przeglądarce na `http://localhost:3000`. Frontend automatycznie dodaje wszystkie wymagane nagłówki bezpieczeństwa. 