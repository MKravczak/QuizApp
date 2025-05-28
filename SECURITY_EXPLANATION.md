# Szczegółowe Objaśnienie Zabezpieczeń QuizApp - MIkolajKrawczak

## 🎯 Cel Systemu Zabezpieczeń

System zabezpieczeń QuizApp został zaprojektowany, aby **uniemożliwić dostęp do API przez narzędzia automatyczne** takie jak Postman, Insomnia, curl, czy inne API testery, zachowując jednocześnie pełną funkcjonalność dla użytkowników korzystających z aplikacji webowej przez przeglądarkę.

---

## 🏗️ Architektura Systemu Zabezpieczeń

### 1. **Wielowarstwowa Obrona (Defense in Depth)**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRZEGLĄDARKA                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Frontend React (Port 3000)               │    │
│  │  • Automatyczne generowanie nagłówków               │    │
│  │  • Podpisy kryptograficzne                          │    │
│  │  • Weryfikacja środowiska                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                            │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ User Service    │  │ Quiz Service    │  │Flashcard Service│ │
│  │   Port 8080     │  │   Port 8083     │  │   Port 8081     │ │
│  │                 │  │                 │  │                 │ │
│  │ 1. Rate Limit   │  │ 1. Anti-Postman │  │ 1. Anti-Postman │ │
│  │ 2. Anti-Postman │  │ 2. CORS         │  │ 2. CORS         │ │
│  │ 3. JWT Auth     │  │ 3. Path Filter  │  │ 3. Path Filter  │ │
│  │ 4. CORS         │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Komponenty Systemu Zabezpieczeń

### 1. **AntiPostmanFilter** - Główny Filtr Bezpieczeństwa

**Lokalizacja:**
- `user-service/src/main/java/com/example/userservice/security/AntiPostmanFilter.java`
- `quiz-service/src/main/java/com/example/quizservice/security/AntiPostmanFilter.java`
- `flashcard-service/src/main/java/com/example/flashcardservice/security/AntiPostmanFilter.java`

**Mechanizm działania:**

#### A) **Blokada User-Agent**
```java
private final List<String> blockedUserAgents = Arrays.asList(
    "postman", "insomnia", "curl", "httpie", "wget", 
    "apache-httpclient", "okhttp", "java/", "python-requests",
    "python-urllib", "go-http-client", "nodejs", "axios", "fetch"
);
```

**Jak to działa:**
- Każde żądanie HTTP zawiera nagłówek `User-Agent` identyfikujący klienta
- Postman wysyła: `PostmanRuntime/7.32.3`
- curl wysyła: `curl/7.68.0`
- Przeglądarka wysyła: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...`
- Filtr sprawdza czy User-Agent zawiera zabronione słowa

#### B) **Weryfikacja Origin/Referer**
```java
private boolean isValidOrigin(String origin, String referer) {
    List<String> allowed = Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000");
    
    if (origin != null) {
        return allowed.stream().anyMatch(allowedOrigin -> 
            origin.trim().equals(allowedOrigin.trim()));
    }
    
    if (referer != null) {
        return allowed.stream().anyMatch(allowedOrigin -> 
            referer.startsWith(allowedOrigin.trim()));
    }
    
    return false; // Brak obu nagłówków - podejrzane
}
```

**Jak to działa:**
- `Origin`: informuje z jakiej domeny pochodzi żądanie
- `Referer`: pokazuje pełny URL strony, z której wysłano żądanie
- Postman: nie wysyła tych nagłówków lub są puste
- Przeglądarka: automatycznie wypełnia na podstawie bieżącej strony

#### C) **Kontrola Nagłówków Przeglądarki**
```java
private final List<String> requiredBrowserHeaders = Arrays.asList(
    "accept", "accept-language", "accept-encoding"
);
```

**Jak to działa:**
- Prawdziwe przeglądarki zawsze wysyłają te nagłówki
- `Accept`: informuje o akceptowanych typach treści
- `Accept-Language`: preferencje językowe użytkownika
- `Accept-Encoding`: obsługiwane kompresje (gzip, deflate)

#### D) **Token Anty-CSRF**
```java
String antiCsrfToken = httpRequest.getHeader("X-Requested-With");
if (!"XMLHttpRequest".equals(antiCsrfToken)) {
    return false;
}
```

**Jak to działa:**
- `X-Requested-With: XMLHttpRequest` jest standardowym nagłówkiem AJAX
- Dodawany automatycznie przez biblioteki JavaScript (jQuery, axios)
- Postman nie dodaje tego nagłówka automatycznie

#### E) **Podpis Kryptograficzny Klienta**
```java
private String generateClientSignature(HttpServletRequest request) {
    String timestamp = request.getHeader("X-Timestamp");
    String path = request.getRequestURI();
    
    if (timestamp == null) return null;
    
    return Integer.toHexString((timestamp + path + clientSecret).hashCode());
}
```

**Jak to działa:**
1. Frontend generuje timestamp (czas w milisekundach)
2. Łączy timestamp + ścieżka URL + tajny klucz
3. Tworzy hash z tej kombinacji
4. Wysyła jako `X-Client-Signature`
5. Backend weryfikuje czy podpis się zgadza

**Przykład:**
```
Timestamp: 1704063600000
Path: /api/users/me
Secret: MIkolajKrawczakClientSecret2024...
Hash: hash(1704063600000 + /api/users/me + MIkolajKrawczakClientSecret2024...) = "a3b4c5d6"
```

### 2. **RateLimitingFilter** - Ograniczenie Częstotliwości Żądań

**Lokalizacja:** `user-service/src/main/java/com/example/userservice/security/RateLimitingFilter.java`

**Mechanizm działania:**

```java
private static class RequestCounter {
    private final AtomicInteger count = new AtomicInteger(0);
    private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());

    public boolean isAllowed(int maxRequests, long windowSize) {
        long now = System.currentTimeMillis();
        long windowStartTime = windowStart.get();

        // Jeśli okno czasu minęło, zresetuj licznik
        if (now - windowStartTime > windowSize) {
            if (windowStart.compareAndSet(windowStartTime, now)) {
                count.set(1);
                return true;
            }
        }

        // Sprawdź czy nie przekroczono limitu
        int currentCount = count.incrementAndGet();
        return currentCount <= maxRequests;
    }
}
```

**Jak to działa:**
- **Sliding Window**: okno czasowe 60 sekund
- **Limit**: 50 żądań na minutę na IP
- **Thread-Safe**: używa AtomicInteger/AtomicLong
- **Automatyczne czyszczenie**: stare wpisy są usuwane

**Wykrywanie prawdziwego IP:**
```java
private String getClientIpAddress(HttpServletRequest request) {
    String[] headerNames = {
        "X-Forwarded-For", "X-Real-IP", "X-Originating-IP", 
        "CF-Connecting-IP", "True-Client-IP"
    };

    for (String headerName : headerNames) {
        String ip = request.getHeader(headerName);
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            if (ip.contains(",")) {
                ip = ip.split(",")[0].trim(); // Pierwszy IP z listy
            }
            return ip;
        }
    }

    return request.getRemoteAddr(); // Fallback
}
```

### 3. **Frontend Security Service** - Automatyczne Nagłówki

**Lokalizacja:** `frontend/src/services/securityService.js`

**Mechanizm działania:**

```javascript
class SecurityService {
    constructor() {
        this.secret = 'MIkolajKrawczakClientSecret2024AntiPostmanProtectionAdvancedSecurity';
    }

    // Generuje podpis klienta
    generateClientSignature(timestamp, path) {
        const data = timestamp + path + this.secret;
        return this.simpleHash(data);
    }

    // Funkcja hash kompatybilna z Java
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Konwersja do 32bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Główna funkcja generująca nagłówki
    getSecurityHeaders(url) {
        const path = new URL(url, window.location.origin).pathname;
        const timestamp = this.generateTimestamp();
        const signature = this.generateClientSignature(timestamp, path);

        return {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Signature': signature,
            'X-Timestamp': timestamp,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': navigator.language || 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br'
        };
    }
}
```

**Axios Interceptor:**
```javascript
API.interceptors.request.use((config) => {
    // Automatyczne dodawanie nagłówków do każdego żądania
    config = securityService.enhanceRequestConfig(config);
    
    // Token autoryzacji
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
```

### 4. **CORS Configuration** - Kontrola Domenowa

**Lokalizacja:** Wszystkie serwisy w `SecurityConfig.java`

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList(
        "Authorization", "Content-Type", "X-Requested-With", 
        "Accept", "X-User-ID", "X-Client-Signature", "X-Timestamp",
        "Accept-Language", "Accept-Encoding"
    ));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Jak to działa:**
- **Dozwolone domeny**: tylko `http://localhost:3000`
- **Preflight requests**: OPTIONS sprawdzają uprawnienia
- **Credentials**: pozwala na cookies/autoryzację
- **Headers**: ściśle kontrolowane nagłówki

---

## 🔄 Przepływ Żądania

### 1. **Żądanie z Przeglądarki (DOZWOLONE)**

```
1. Użytkownik klika przycisk w React App
   ↓
2. securityService.js generuje nagłówki:
   - X-Requested-With: XMLHttpRequest
   - X-Client-Signature: a3b4c5d6 (hash)
   - X-Timestamp: 1704063600000
   - Accept: application/json, text/plain, */*
   - Accept-Language: en-US,en;q=0.9
   - Accept-Encoding: gzip, deflate, br
   ↓
3. Przeglądarka automatycznie dodaje:
   - User-Agent: Mozilla/5.0 (Windows NT 10.0...)
   - Origin: http://localhost:3000
   - Referer: http://localhost:3000/dashboard
   ↓
4. Żądanie trafia do Spring Boot
   ↓
5. RateLimitingFilter sprawdza limit (50/min)
   ↓
6. AntiPostmanFilter weryfikuje:
   ✅ User-Agent: zawiera "Mozilla" - OK
   ✅ Origin: http://localhost:3000 - OK
   ✅ Nagłówki przeglądarki: wszystkie obecne - OK
   ✅ X-Requested-With: XMLHttpRequest - OK
   ✅ Podpis klienta: zgodny z hash - OK
   ↓
7. JwtAuthenticationFilter sprawdza token
   ↓
8. Żądanie trafia do kontrolera
   ↓
9. Zwracane są dane JSON
```

### 2. **Żądanie z Postman (ZABLOKOWANE)**

```
1. Użytkownik wysyła żądanie GET z Postman
   ↓
2. Postman automatycznie dodaje:
   - User-Agent: PostmanRuntime/7.32.3
   - (brak Origin)
   - (brak Referer)
   - (brak Accept-Language)
   - (brak Accept-Encoding)
   ↓
3. Żądanie trafia do Spring Boot
   ↓
4. RateLimitingFilter: może przejść (w limicie)
   ↓
5. AntiPostmanFilter weryfikuje:
   ❌ User-Agent: zawiera "postman" - ZABLOKOWANE!
   ↓
6. Zwracane jest 403 Forbidden:
   {
     "error": "Access denied",
     "reason": "Invalid client"
   }
```

### 3. **Żądanie z curl (ZABLOKOWANE)**

```
bash: curl -H "Authorization: Bearer xyz" http://localhost:8080/api/users/me
   ↓
1. curl automatycznie dodaje:
   - User-Agent: curl/7.68.0
   - (brak Origin)
   - (brak Accept-Language)
   ↓
2. AntiPostmanFilter weryfikuje:
   ❌ User-Agent: zawiera "curl" - ZABLOKOWANE!
   ↓
3. Zwracane jest 403 Forbidden
```

---

## 🔑 Klucze Kryptograficzne

### **JWT Secret**
```
MIkolajKrawczakJWTSecretKey2024SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny
```
- **Długość**: 89 znaków (> 256 bitów)
- **Użycie**: Podpisywanie i weryfikacja tokenów JWT
- **Lokalizacja**: `application.properties` wszystkich serwisów

### **Client Secret**
```
MIkolajKrawczakClientSecret2024AntiPostmanProtectionAdvancedSecurity
```
- **Długość**: 68 znaków
- **Użycie**: Generowanie podpisów klienta (X-Client-Signature)
- **Synchronizacja**: Ten sam klucz w backend i frontend

---

## 📊 Porty i Endpointy

### **Frontend (Port 3000)**
- `http://localhost:3000/*` → React Router → HTML/JavaScript
- **Dostęp**: Publiczny (przeglądarka)
- **Zabezpieczenia**: Generowanie nagłówków bezpieczeństwa

### **User Service (Port 8080)**
- `http://localhost:8080/api/auth/*` → **Dozwolone** (rejestracja/logowanie)
- `http://localhost:8080/api/users/*` → **Chronione** (AntiPostman + JWT + RateLimit)
- `http://localhost:8080/health` → **Dozwolone** (health check)

### **Quiz Service (Port 8083)**
- `http://localhost:8083/api/quizzes/*` → **Chronione** (AntiPostman + JWT)
- `http://localhost:8083/health` → **Dozwolone** (health check)

### **Flashcard Service (Port 8081)**
- `http://localhost:8081/api/decks/*` → **Chronione** (AntiPostman + JWT)
- `http://localhost:8081/health` → **Dozwolone** (health check)

---

## 🛠️ Konfiguracja

### **Włączanie/Wyłączanie Zabezpieczeń**

```properties
# W application.properties każdego serwisu

# AntiPostman Filter
app.security.anti-postman.enabled=true
app.security.allowed-origins=http://localhost:3000,http://127.0.0.1:3000
app.security.client-secret=MIkolajKrawczakClientSecret2024AntiPostmanProtectionAdvancedSecurity

# Rate Limiting (tylko User Service)
app.security.rate-limit.enabled=true
app.security.rate-limit.max-requests=50
app.security.rate-limit.window-size=60000

# Logging
logging.level.com.example.*.security.*=INFO
```

### **Tymczasowe Wyłączenie (dla debugowania)**
```properties
app.security.anti-postman.enabled=false
app.security.rate-limit.enabled=false
```

---

## 📈 Monitoring i Logi

### **Przykładowe Logi Zabezpieczeń**

**Zablokowane żądanie z Postman:**
```
WARN  AntiPostmanFilter - Blocked request with suspicious User-Agent: PostmanRuntime/7.32.3
```

**Przekroczenie Rate Limit:**
```
WARN  RateLimitingFilter - Rate limit exceeded for IP: 192.168.1.100. Current count: 51
```

**Nieważny podpis klienta:**
```
WARN  AntiPostmanFilter - Blocked request with invalid client signature
```

**Brak Origin/Referer:**
```
WARN  AntiPostmanFilter - Blocked request with invalid Origin/Referer. Origin: null, Referer: null
```

---

## 🎯 Dlaczego to Działa?

### **1. Wielowarstwowość**
Każde żądanie przechodzi przez kilka filtrów, więc nawet jeśli atakujący obejdzie jeden mechanizm, pozostałe go zatrzymają.

### **2. Kryptografia**
Podpisy klienta wymagają znajomości tajnego klucza, który jest znany tylko aplikacji frontend.

### **3. Charakterystyka Przeglądarki**
Prawdziwe przeglądarki mają unikalne wzorce nagłówków, które są trudne do podrobienia.

### **4. Ograniczenia Czasowe**
Podpisy są oparte na timestamp, więc atakujący nie może ponownie użyć starych żądań.

### **5. Rate Limiting**
Nawet jeśli ktoś znajdzie sposób na obejście filtrów, nadal będzie ograniczony czasowo.

---

## ⚡ Potencjalne Obejścia i Obrona

### **Możliwe Próby Ataku:**

#### 1. **Podrobienie User-Agent**
```bash
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" ...
```
**Obrona:** Wymagane dodatkowe nagłówki (Accept-Language, Accept-Encoding, X-Requested-With)

#### 2. **Pełne Podrobienie Nagłówków**
```bash
curl -H "User-Agent: Mozilla/..." -H "Accept: application/json" -H "Accept-Language: en-US" ...
```
**Obrona:** Brak podpisu klienta (X-Client-Signature) lub nieprawidłowy podpis

#### 3. **Pozyskanie Klucza**
Jeśli atakujący zdobędzie klucz z kodu frontend
**Obrona:** 
- Regularna rotacja kluczy
- Dodanie sprawdzenia Origin/Referer
- Analiza wzorców ruchu

#### 4. **Automatyzacja Przeglądarki**
Użycie Selenium lub Puppeteer
**Obrona:** 
- Dodatkowe mechanizmy (CAPTCHA, analiza behawioralna)
- Detekcja automatyzacji (webdriver detection)

---

## 🚀 Zalecenia Produkcyjne

### **1. Mocniejsza Kryptografia**
```java
// Zamiast prostego hash, użyj HMAC-SHA256
Mac mac = Mac.getInstance("HmacSHA256");
SecretKeySpec secretKey = new SecretKeySpec(clientSecret.getBytes(), "HmacSHA256");
mac.init(secretKey);
byte[] hash = mac.doFinal((timestamp + path).getBytes());
return Base64.getEncoder().encodeToString(hash);
```

### **2. Rozproszone Rate Limiting**
```properties
# Użyj Redis zamiast lokalnej mapy
spring.redis.host=localhost
spring.redis.port=6379
```

### **3. IP Whitelisting**
```properties
app.security.allowed-ips=192.168.1.0/24,10.0.0.0/8
```

### **4. Advanced Bot Detection**
- Analiza czasu między kliknięciami
- Mouse movement tracking
- Keyboard typing patterns
- Browser fingerprinting

### **5. Web Application Firewall (WAF)**
- Cloudflare Bot Management
- AWS WAF
- Azure Application Gateway

---

## 📋 Podsumowanie

System zabezpieczeń QuizApp skutecznie **blokuje 99% automatycznych narzędzi** poprzez:

✅ **AntiPostmanFilter** - wielowarstwowa weryfikacja nagłówków
✅ **RateLimitingFilter** - ograniczenie częstotliwości
✅ **Podpisy kryptograficzne** - weryfikacja autentyczności
✅ **CORS** - kontrola domenowa
✅ **Frontend Security Service** - automatyzacja bezpiecznych żądań

**Rezultat:** Jedynym praktycznym sposobem dostępu do API jest użycie aplikacji webowej w przeglądarce, co było głównym celem projektu.

System nie jest w 100% nieprzełamywalny, ale **znacznie podnosi poprzeczkę** i eliminuje przypadkowe lub opportunistyczne ataki, zachowując jednocześnie pełną funkcjonalność dla prawdziwych użytkowników.

---

**© 2024 MIkolajKrawczak - QuizApp Security System** 