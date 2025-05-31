# Dokumentacja Zabezpieczeń QuizApp

## Wprowadzone Zabezpieczenia Anti-Postman

Aplikacja QuizApp została wyposażona w zaawansowane mechanizmy zabezpieczeń, które znacznie utrudniają lub uniemożliwiają korzystanie z API przez narzędzia takie jak Postman, Insomnia, curl itp.

### 1. AntiPostmanFilter

#### Funkcjonalność:
- **Weryfikacja User-Agent**: Blokuje znane User-Agent strings narzędzi automatycznych
- **Sprawdzanie Origin/Referer**: Wymaga żądań z dozwolonych domen
- **Kontrola nagłówków przeglądarki**: Wymaga obecności standardowych nagłówków przeglądarki
- **Token anty-CSRF**: Wymaga nagłówka `X-Requested-With: XMLHttpRequest`
- **Podpis klienta**: Weryfikuje niestandardowy podpis oparty na timestamp i ścieżce

#### Blokowane User-Agent strings:
- postman
- insomnia 
- curl
- httpie
- wget
- apache-httpclient
- okhttp
- java/
- python-requests
- python-urllib
- go-http-client
- nodejs
- axios (gdy nie z przeglądarki)
- fetch (gdy nie z przeglądarki)

#### Wymagane nagłówki:
- `Accept`
- `Accept-Language`
- `Accept-Encoding`
- `X-Requested-With: XMLHttpRequest`
- `X-Client-Signature` (wygenerowany podpis)
- `X-Timestamp` (timestamp żądania)

### 2. RateLimitingFilter

#### Funkcjonalność:
- Ogranicza liczbę żądań z jednego IP adresu
- Domyślnie: 50 żądań na minutę
- Automatyczne czyszczenie starych wpisów
- Wykrywa rzeczywisty IP nawet za proxy/load balancer

#### Konfiguracja:
```properties
app.security.rate-limit.enabled=true
app.security.rate-limit.max-requests=50
app.security.rate-limit.window-size=60000
```

### 3. Frontend Security Service

#### JavaScript Helper:
```javascript
// Automatyczne dodawanie wymaganych nagłówków
const securityHeaders = {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Signature': generateSignature(),
    'X-Timestamp': timestamp,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': navigator.language,
    'Accept-Encoding': 'gzip, deflate, br'
};
```

### 4. CORS Configuration

#### Ograniczone domeny:
- `http://localhost:3000` (development frontend)
- `http://127.0.0.1:3000` (alternative localhost)

#### Zabezpieczone nagłówki:
Wszystkie niestandardowe nagłówki są ściśle kontrolowane przez konfigurację CORS.

## Konfiguracja per serwis

### User Service (Port 8080)
```properties
app.security.anti-postman.enabled=true
app.security.allowed-origins=http://localhost:3000,http://127.0.0.1:3000
app.security.rate-limit.enabled=true
app.security.rate-limit.max-requests=50
```

### Quiz Service (Port 8083)
```properties
app.security.anti-postman.enabled=true
app.security.allowed-origins=http://localhost:3000,http://127.0.0.1:3000
```

### Flashcard Service (Port 8081)
```properties
app.security.anti-postman.enabled=true
app.security.allowed-origins=http://localhost:3000,http://127.0.0.1:3000
```

## Jak to działa

### 1. Żądanie z przeglądarki (dozwolone):
```http
GET /api/users/me HTTP/1.1
Host: localhost:8080
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Accept-Encoding: gzip, deflate, br
Origin: http://localhost:3000
X-Requested-With: XMLHttpRequest
X-Client-Signature: abc123def456
X-Timestamp: 1704063600000
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

### 2. Żądanie z Postmana (zablokowane):
```http
GET /api/users/me HTTP/1.1
Host: localhost:8080
User-Agent: PostmanRuntime/7.32.3
Accept: */*
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Wynik**: `403 Forbidden - Invalid client`

### 3. Żądanie z curl (zablokowane):
```bash
curl -H "Authorization: Bearer token" http://localhost:8080/api/users/me
```

**Wynik**: `403 Forbidden - Invalid client`

## Obejścia (dla testowania)

### 1. Wyłączenie filtrów:
```properties
app.security.anti-postman.enabled=false
app.security.rate-limit.enabled=false
```

### 2. Dodanie wyjątków w kodzie:
Można modyfikować metody `isExcludedPath()` w filtrach.

### 3. Użycie prawdziwej przeglądarki:
Jedynym sposobem na korzystanie z API jest użycie aplikacji frontend uruchomionej w przeglądarce.

## Monitoring i Logi

### Logi zabezpieczeń:
```properties
logging.level.com.example.userservice.security.AntiPostmanFilter=INFO
logging.level.com.example.userservice.security.RateLimitingFilter=INFO
```

### Przykładowe logi:
```
WARN  AntiPostmanFilter - Blocked request with suspicious User-Agent: PostmanRuntime/7.32.3
WARN  AntiPostmanFilter - Blocked request with invalid Origin/Referer. Origin: null, Referer: null
WARN  RateLimitingFilter - Rate limit exceeded for IP: 192.168.1.100. Current count: 51
```

## Zalecenia dla produkcji

1. **Mocniejsza kryptografia**: Zastąp prostą funkcję hash implementacją HMAC-SHA256
2. **Distributed Rate Limiting**: Użyj Redis dla skalowania poziomego
3. **IP Whitelisting**: Dodaj listę zaufanych IP
4. **Monitoring**: Integracja z systemami alertów
5. **WAF**: Rozważ użycie Web Application Firewall
6. **Bot Detection**: Implementacja zaawansowanej detekcji botów

## Uwagi

⚠️ **Ważne**: Te zabezpieczenia **NIE SĄ** 100% nieprzełamalne. Doświadczony atakujący może je obejść, ale znacznie podnoszą poprzeczkę i zniechęcają do przypadkowego lub automatycznego wykorzystania API.

🔒 **Bezpieczeństwo**: Te mechanizmy stanowią dodatkową warstwę zabezpieczeń i nie zastępują standardowych praktyk bezpieczeństwa takich jak uwierzytelnianie, autoryzacja czy walidacja danych.

📝 **Testowanie**: W środowisku deweloperskim możesz tymczasowo wyłączyć filtry dla ułatwienia testowania. 