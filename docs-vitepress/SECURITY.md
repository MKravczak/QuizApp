# 🔐 QuizApp Security Documentation

## Spis treści

- [Przegląd bezpieczeństwa](#przegląd-bezpieczeństwa)
- [Autentykacja JWT](#autentykacja-jwt)
- [Filtry bezpieczeństwa](#filtry-bezpieczeństwa)
- [Autoryzacja](#autoryzacja)
- [Konfiguracja CORS](#konfiguracja-cors)
- [Security Headers](#security-headers)
- [Rate Limiting](#rate-limiting)
- [Monitoring i auditing](#monitoring-i-auditing)
- [Środowiska i deployment](#środowiska-i-deployment)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

## Przegląd bezpieczeństwa

QuizApp implementuje wielowarstwową architekturę bezpieczeństwa opartą na:

- **JWT (JSON Web Tokens)** - bezstanowa autentykacja
- **Spring Security** - autoryzacja i kontrola dostępu
- **CORS** - kontrola żądań cross-origin
- **Rate Limiting** - ochrona przed atakami DoS
- **Security Headers** - dodatkowe nagłówki bezpieczeństwa
- **BCrypt** - bezpieczne hashowanie haseł

### Architektura bezpieczeństwa

```
Frontend (React) 
    ↓ [HTTPS] + Security Headers
API Gateway/Load Balancer (opcjonalnie)
    ↓ [HTTP] + JWT + CORS
Mikroserwisy (Spring Boot + Spring Security)
    ↓ [JDBC]
PostgreSQL Database
```

## Autentykacja JWT

### Konfiguracja JWT

**Wspólny klucz dla wszystkich mikroserwisów:**
```
MIkolajKrawczakJWTSecretKey2024SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny
```

**Czasy wygaśnięcia:**
- Access Token: 24 godziny (86400000 ms)
- Refresh Token: 7 dni (604800000 ms)

### Implementacja JWT

#### JwtTokenProvider
```java
@Component
public class JwtTokenProvider {
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
```

#### JwtAuthenticationFilter
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtTokenProvider.validateJwtToken(jwt)) {
                String username = jwtTokenProvider.getUsernameFromJwtToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
```

### Flow autentykacji

1. **Logowanie**: `POST /api/auth/login`
   ```json
   {
     "username": "user",
     "password": "password"
   }
   ```

2. **Odpowiedź z tokenami**:
   ```json
   {
     "token": "eyJhbGciOiJIUzUxMiJ9...",
     "refreshToken": "c4f2a3e1-...",
     "type": "Bearer",
     "id": 1,
     "username": "user",
     "email": "user@example.com",
     "roles": ["ROLE_USER"]
   }
   ```

3. **Używanie tokenu**:
   ```text
   Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
   X-User-ID: 1
   ```

4. **Odświeżanie tokenu**: `POST /api/auth/refresh-token`
   ```json
   {
     "refreshToken": "c4f2a3e1-..."
   }
   ```

## Filtry bezpieczeństwa

### AntiPostmanFilter (WYŁĄCZONY)

**Status**: Aktualnie wyłączony we wszystkich mikroserwisach

**Powód wyłączenia**: Przeszkadzał w normalnym funkcjonowaniu aplikacji

**Konfiguracja wyłączenia**:
```text
# application.properties
app.security.anti-postman.enabled=false

# docker-compose.yml
APP_SECURITY_ANTI_POSTMAN_ENABLED: "false"
```

**Mechanizm działania (gdy włączony)**:
```java
@Component
public class AntiPostmanFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        if (!antiPostmanEnabled) {
            chain.doFilter(request, response);
            return;
        }
        
        // 1. Sprawdź User-Agent
        String userAgent = httpRequest.getHeader("User-Agent");
        if (isBlockedUserAgent(userAgent)) {
            sendBlockedResponse(response, "Invalid client");
            return;
        }
        
        // 2. Sprawdź Origin/Referer
        if (!isValidOrigin(origin, referer)) {
            sendBlockedResponse(response, "Invalid origin");
            return;
        }
        
        // 3. Sprawdź wymagane nagłówki
        if (!hasBrowserHeaders(httpRequest)) {
            sendBlockedResponse(response, "Missing required headers");
            return;
        }
        
        // 4. Sprawdź podpis klienta
        if (!isValidClientSignature(securityHeader, httpRequest)) {
            sendBlockedResponse(response, "Invalid client signature");
            return;
        }
        
        chain.doFilter(request, response);
    }
}
```

**Blokowane User-Agents**:
- postman, insomnia, curl, httpie, wget
- apache-httpclient, okhttp, java/
- python-requests, python-urllib
- go-http-client, nodejs

### RateLimitingFilter

**Aktywny w**: user-service

**Konfiguracja**:
```text
app.security.rate-limit.enabled=true
app.security.rate-limit.max-requests=50
app.security.rate-limit.window-size=60000
```

**Implementacja**:
```java
@Component
public class RateLimitingFilter implements Filter {
    private final ConcurrentHashMap<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        String clientIP = getClientIP(request);
        
        if (isRateLimited(clientIP)) {
            sendRateLimitResponse(response);
            return;
        }
        
        incrementRequestCount(clientIP);
        chain.doFilter(request, response);
    }
    
    private boolean isRateLimited(String clientIP) {
        RequestCounter counter = requestCounters.get(clientIP);
        if (counter == null) return false;
        
        return counter.getRequestCount().get() >= maxRequestsPerMinute;
    }
}
```

### Security Filter Chain

**Kolejność filtrów w Spring Security**:
1. `DisableEncodeUrlFilter`
2. `WebAsyncManagerIntegrationFilter`
3. `SecurityContextHolderFilter`
4. `HeaderWriterFilter`
5. `CorsFilter`
6. `LogoutFilter`
7. `RateLimitingFilter` (user-service)
8. `AntiPostmanFilter` (wyłączony)
9. `JwtAuthenticationFilter`
10. `RequestCacheAwareFilter`
11. `SecurityContextHolderAwareRequestFilter`
12. `AnonymousAuthenticationFilter`
13. `SessionManagementFilter`
14. `ExceptionTranslationFilter`
15. `AuthorizationFilter`

## Autoryzacja

### System ról

```java
public enum ERole {
    ROLE_USER,
    ROLE_ADMIN
}
```

### Kontrola dostępu na poziomie metod

```java
// Dostęp dla zalogowanych użytkowników
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public ResponseEntity<User> getCurrentUser() { ... }

// Dostęp tylko dla administratorów
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<User>> getAllUsers() { ... }

// Sprawdzenie właściciela zasobu
@PreAuthorize("@flashcardDeckService.isOwner(#deckId, authentication.principal.id)")
public ResponseEntity<?> updateDeck(@PathVariable Long deckId) { ... }
```

### Walidacja właściciela zasobów

```java
@Service
public class OwnershipValidator {
    
    public boolean isQuizOwner(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        return quiz != null && quiz.getUserId().equals(userId);
    }
    
    public boolean isDeckOwner(Long deckId, Long userId) {
        FlashcardDeck deck = deckRepository.findById(deckId).orElse(null);
        return deck != null && deck.getUserId().equals(userId);
    }
}
```

## Konfiguracja CORS

### Spring Security CORS Configuration

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Dozwolone domeny
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    
    // Dozwolone metody HTTP
    configuration.setAllowedMethods(Arrays.asList(
        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
    ));
    
    // Dozwolone nagłówki
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
    
    // Nagłówki widoczne dla klienta
    configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
    
    // Uwierzytelnienie w żądaniach cross-origin
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Statistics Service CORS (prostsza konfiguracja)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("X-User-ID")
                .allowCredentials(true);
    }
}
```

## Security Headers

### Frontend Security Service

**Automatyczne dodawanie nagłówków**:
```javascript
// securityService.js
class SecurityService {
    enhanceRequestConfig(config) {
        const timestamp = Date.now().toString();
        const path = new URL(config.url, config.baseURL || window.location.origin).pathname;
        const clientSecret = 'MIkolajKrawczakClientSecret2024AntiPostmanProtectionAdvancedSecurity';
        
        // Generuj podpis bezpieczeństwa
        const signature = this.generateSignature(timestamp, path, clientSecret);
        
        config.headers = {
            ...config.headers,
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Signature': signature,
            'X-Timestamp': timestamp,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,pl;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': navigator.userAgent || 'Mozilla/5.0 (compatible; QuizApp/1.0)'
        };
        
        return config;
    }
    
    generateSignature(timestamp, path, clientSecret) {
        const data = timestamp + path + clientSecret;
        return this.simpleHash(data);
    }
    
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
}
```

### Axios Request Interceptor

```javascript
// api.js
API.interceptors.request.use(
    (config) => {
        console.log('🔒 Adding security headers to request:', config.url);
        
        // Dodaj nagłówki bezpieczeństwa
        config = securityService.enhanceRequestConfig(config);
        
        // Dodaj token autoryzacji
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Dodaj User ID
        const userId = localStorage.getItem('userId');
        if (userId) {
            config.headers['X-User-ID'] = userId;
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);
```

## Rate Limiting

### Implementacja w User Service

```java
@Component
@Order(1)
public class RateLimitingFilter implements Filter {
    
    @Value("${app.security.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;
    
    @Value("${app.security.rate-limit.max-requests:100}")
    private int maxRequestsPerMinute;
    
    @Value("${app.security.rate-limit.window-size:60000}")
    private long windowSizeMs;
    
    private final ConcurrentHashMap<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        if (!rateLimitEnabled) {
            chain.doFilter(request, response);
            return;
        }
        
        String clientIP = getClientIP((HttpServletRequest) request);
        
        if (isRateLimited(clientIP)) {
            sendRateLimitExceededResponse((HttpServletResponse) response);
            return;
        }
        
        incrementRequestCount(clientIP);
        chain.doFilter(request, response);
    }
    
    private boolean isRateLimited(String clientIP) {
        RequestCounter counter = requestCounters.computeIfAbsent(clientIP, k -> new RequestCounter());
        
        long currentTime = System.currentTimeMillis();
        long windowStart = counter.getWindowStart().get();
        
        // Reset okna czasowego
        if (currentTime - windowStart > windowSizeMs) {
            counter.getRequestCount().set(0);
            counter.getWindowStart().set(currentTime);
            return false;
        }
        
        return counter.getRequestCount().get() >= maxRequestsPerMinute;
    }
    
    private void incrementRequestCount(String clientIP) {
        RequestCounter counter = requestCounters.get(clientIP);
        if (counter != null) {
            counter.getRequestCount().incrementAndGet();
        }
    }
}

class RequestCounter {
    private final AtomicInteger requestCount = new AtomicInteger(0);
    private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
    
    // getters...
}
```

### Monitoring Rate Limiting

```text
# Logi rate limiting
logging.level.com.example.userservice.security.RateLimitingFilter=INFO
```

**Przykładowe logi**:
```
2024-01-15 10:30:15 WARN RateLimitingFilter - Rate limit exceeded for IP: 192.168.1.100
2024-01-15 10:30:15 INFO RateLimitingFilter - Current request count for IP 192.168.1.100: 51/50
```

## Monitoring i auditing

### Security Logging

**Konfiguracja logowania**:
```text
# application.properties
logging.level.org.springframework.security=DEBUG
logging.level.com.example.userservice.security.JwtAuthenticationFilter=DEBUG
logging.level.com.example.userservice.security.AntiPostmanFilter=INFO
logging.level.com.example.userservice.security.RateLimitingFilter=INFO
logging.level.org.springframework.web=DEBUG
```

### Monitorowane zdarzenia bezpieczeństwa

1. **Nieudane uwierzytelnienia JWT**:
   ```java
   logger.error("Cannot set user authentication: {}", e.getMessage());
   ```

2. **Zablokowane żądania**:
   ```java
   logger.warn("Blocked request with suspicious User-Agent: {}", userAgent);
   logger.warn("Blocked request with invalid Origin/Referer. Origin: {}, Referer: {}", origin, referer);
   ```

3. **Przekroczenie rate limit**:
   ```java
   logger.warn("Rate limit exceeded for IP: {}", clientIP);
   ```

4. **Próby dostępu bez autoryzacji**:
   ```java
   logger.warn("Access denied for user {} to resource {}", username, requestUri);
   ```

### Security Metrics

**Przykłady metryk do zbierania**:
- Liczba prób logowania (udane/nieudane)
- Liczba zablokowanych żądań przez filtry
- Wykorzystanie rate limit per IP
- Częstotliwość odświeżania tokenów
- Próby dostępu do chronionych zasobów

## Środowiska i deployment

### Development Environment

```yaml
# docker-compose.yml
services:
  user-service:
    environment:
      # JWT
      APP_JWT_SECRET: "MIkolajKrawczakJWTSecretKey2024SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny"
      
      # Security Filters
      APP_SECURITY_ANTI_POSTMAN_ENABLED: "false"
      
      # Rate Limiting
      APP_SECURITY_RATE_LIMIT_ENABLED: "true"
      APP_SECURITY_RATE_LIMIT_MAX_REQUESTS: "50"
      APP_SECURITY_RATE_LIMIT_WINDOW_SIZE: "60000"
      
      # CORS
      APP_SECURITY_ALLOWED_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000"
```

### Production Environment (zalecenia)

```yaml
# docker-compose.prod.yml
services:
  user-service:
    environment:
      # JWT - UŻYJ BEZPIECZNEGO KLUCZA!
      APP_JWT_SECRET: "${JWT_SECRET_FROM_VAULT}"
      
      # Security Filters
      APP_SECURITY_ANTI_POSTMAN_ENABLED: "true"
      
      # Rate Limiting - bardziej restrykcyjne
      APP_SECURITY_RATE_LIMIT_ENABLED: "true"
      APP_SECURITY_RATE_LIMIT_MAX_REQUESTS: "20"
      APP_SECURITY_RATE_LIMIT_WINDOW_SIZE: "60000"
      
      # CORS - tylko produkcyjna domena
      APP_SECURITY_ALLOWED_ORIGINS: "https://yourdomain.com"
      
      # Database
      SPRING_DATASOURCE_URL: "${DATABASE_URL}"
      SPRING_DATASOURCE_USERNAME: "${DATABASE_USERNAME}"
      SPRING_DATASOURCE_PASSWORD: "${DATABASE_PASSWORD}"
```

### Environment Variables Security

**Wymagane zmienne środowiskowe**:
```bash
# JWT Configuration
export APP_JWT_SECRET="your-super-secure-secret-key-here"
export APP_JWT_EXPIRATION="86400000"
export APP_JWT_REFRESH_EXPIRATION="604800000"

# Security Filters
export APP_SECURITY_ANTI_POSTMAN_ENABLED="false"
export APP_SECURITY_ALLOWED_ORIGINS="http://localhost:3000"
export APP_SECURITY_CLIENT_SECRET="your-client-secret"

# Rate Limiting
export APP_SECURITY_RATE_LIMIT_ENABLED="true"
export APP_SECURITY_RATE_LIMIT_MAX_REQUESTS="50"
export APP_SECURITY_RATE_LIMIT_WINDOW_SIZE="60000"

# Database
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/quizapp"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="secure-password"
```

## Troubleshooting

### Typowe problemy bezpieczeństwa

#### 1. JWT "signature does not match"

**Problem**: Token JWT jest odrzucany z błędem "JWT signature does not match locally computed signature"

**Przyczyny**:
- Różne JWT secret w mikroserwisach
- Brak zmiennej środowiskowej `APP_JWT_SECRET`
- Token wygenerowany z innym kluczem

**Rozwiązanie**:
```bash
# Sprawdź zmienne środowiskowe
docker compose exec user-service env | grep JWT

# Upewnij się, że wszystkie serwisy mają ten sam secret
docker compose exec quiz-service env | grep JWT
docker compose exec flashcard-service env | grep JWT
```

#### 2. CORS errors

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Przyczyny**:
- Niepoprawna konfiguracja allowed origins
- Brak wymaganych nagłówków w konfiguracji CORS
- Problemy z preflight requests

**Rozwiązanie**:
```java
// Sprawdź konfigurację CORS
configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
configuration.setAllowCredentials(true);
configuration.setAllowedHeaders(Arrays.asList("*")); // lub konkretne nagłówki
```

#### 3. Rate limiting false positives

**Problem**: Prawidłowi użytkownicy są blokowi przez rate limiting

**Przyczyny**:
- Zbyt niskie limity
- Problemy z identyfikacją IP (proxy, load balancer)
- Brak resetowania liczników

**Rozwiązanie**:
```text
# Zwiększ limity
app.security.rate-limit.max-requests=100
app.security.rate-limit.window-size=60000

# Lub wyłącz czasowo
app.security.rate-limit.enabled=false
```

#### 4. AntiPostmanFilter blocking legitimate requests

**Problem**: Prawdziwe żądania z przeglądarki są blokowane

**Przyczyny**:
- Brak wymaganych nagłówków przeglądarki
- Niepoprawny User-Agent
- Błędny podpis klienta

**Rozwiązanie**: Wyłącz filter:
```text
app.security.anti-postman.enabled=false
```

### Debug logging

**Włącz szczegółowe logowanie bezpieczeństwa**:
```text
logging.level.org.springframework.security=DEBUG
logging.level.com.example.userservice.security=DEBUG
logging.level.org.springframework.web.cors=DEBUG
```

## Security Checklist

### ✅ Development Checklist

- [ ] JWT secret jest ustawiony we wszystkich mikroserwisach
- [ ] Wszystkie endpointy mają odpowiednią autoryzację
- [ ] CORS jest poprawnie skonfigurowany
- [ ] Hasła są hashowane z BCrypt
- [ ] Rate limiting jest skonfigurowany
- [ ] Logowanie bezpieczeństwa jest włączone
- [ ] Frontend dodaje wymagane nagłówki bezpieczeństwa

### ✅ Production Checklist

- [ ] HTTPS jest włączony dla całej komunikacji
- [ ] JWT secret jest generowany losowo i przechowywany bezpiecznie
- [ ] Rotacja kluczy JWT jest zaimplementowana
- [ ] CORS origins są ograniczone do produkcyjnych domen
- [ ] Rate limiting ma odpowiednie limity produkcyjne
- [ ] AntiPostmanFilter jest włączony i skonfigurowany
- [ ] Database credentials są bezpieczne
- [ ] Monitoring bezpieczeństwa jest aktywny
- [ ] Backup i disaster recovery są skonfigurowane
- [ ] Security headers (HSTS, CSP, etc.) są dodane
- [ ] Regular security audits są zaplanowane

### ⚠️ Known Security Limitations

1. **AntiPostmanFilter wyłączony** - zwiększa ryzyko automatycznych ataków
2. **Wspólny JWT secret** - kompromitacja klucza wpływa na wszystkie serwisy
3. **HTTP w development** - dane są przesyłane nieszyfrowanie
4. **Brak rotacji kluczy** - długoterminowe wykorzystanie tego samego klucza
5. **Stateless sessions** - trudność w natychmiastowym unieważnieniu sesji
6. **Client-side token storage** - tokeny w localStorage są podatne na XSS

### 🔒 Future Security Enhancements

1. **OAuth 2.0 / OpenID Connect** - integracja z zewnętrznymi dostawcami tożsamości
2. **API Gateway** - centralizacja uwierzytelniania i autoryzacji
3. **Distributed session management** - Redis dla współdzielonych sesji
4. **Certificate-based authentication** - dla komunikacji między serwisami
5. **Advanced threat detection** - AI-based anomaly detection
6. **Zero-trust architecture** - weryfikacja każdego żądania
7. **Secret management** - HashiCorp Vault lub AWS Secrets Manager
8. **Container security scanning** - automatyczne skanowanie obrazów Docker

---

**Ostatnia aktualizacja**: 2024-01-15  
**Wersja dokumentu**: 1.0  
**Kontakt bezpieczeństwa**: security@quizapp.com 
