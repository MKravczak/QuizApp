# 🔐 QuizApp Security Documentation

## Spis treści

- [Kompleksowy przegląd zabezpieczeń](#kompleksowy-przegląd-zabezpieczeń)
- [Przegląd bezpieczeństwa](#przegląd-bezpieczeństwa)
- [Łańcuch Filtrów Spring Security](#łańcuch-filtrów-spring-security)
- [Autentykacja JWT](#autentykacja-jwt)
- [Autoryzacja](#autoryzacja)
- [Konfiguracja CORS](#konfiguracja-cors)
- [Security Headers](#security-headers)
- [Rate Limiting](#rate-limiting)
- [Monitoring i auditing](#monitoring-i-auditing)
- [Środowiska i deployment](#środowiska-i-deployment)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

## Kompleksowy przegląd zabezpieczeń

System QuizApp implementuje wielowarstwową architekturę bezpieczeństwa, która zapewnia kompleksową ochronę na wszystkich poziomach aplikacji. Głównym filarem bezpieczeństwa jest autentykacja oparta na tokenach JWT (JSON Web Tokens), która umożliwia bezstanową i skalowalną komunikację między mikroserwisami. System wykorzystuje zaawansowane mechanizmy walidacji tokenów, które weryfikują nie tylko ważność czasową i kryptograficzną, ale także implementują ochronę przed atakami replay i wykrywają próby wykorzystania skompromitowanych tokenów.

Autoryzacja w systemie opiera się na Spring Security z rolami RBAC (Role-Based Access Control), gdzie użytkownicy mogą posiadać role USER lub ADMIN, a każda z nich ma ściśle określone uprawnienia. System USER umożliwia tworzenie i zarządzanie własnymi fiszkami i quizami, uczestnictwo w quizach publicznych oraz przeglądanie własnych statystyk. Rola ADMIN zapewnia pełny dostęp administracyjny, włączając w to zarządzanie użytkownikami, moderowanie treści, dostęp do globalnych statystyk oraz konfigurację systemu. Dodatkowo system implementuje autoryzację na poziomie grup, gdzie użytkownicy mogą należeć do różnych grup edukacyjnych i mieć dostęp tylko do zasobów przypisanych do ich grup. Wszystkie endpointy są zabezpieczone na poziomie metod za pomocą adnotacji Spring Security.

**Ochrona przed atakami** realizowana jest poprzez kilka mechanizmów. Rate Limiting ogranicza liczbę żądań do 50 na minutę dla każdego IP, co chroni przed atakami DoS i brute force. Filtry Anti-Postman (obecnie wyłączone do testów) mogą blokować automatyczne narzędzia testujące. Hasła są hashowane przy użyciu BCrypt z odpowiednią solą, co zapewnia odporność na ataki słownikowe i rainbow tables.

**Konfiguracja CORS** jest ściśle kontrolowana i pozwala na żądania tylko z określonych domen (localhost:3000 dla development). System implementuje wszystkie niezbędne nagłówki bezpieczeństwa, w tym Content-Security-Policy, X-Frame-Options, X-Content-Type-Options i Strict-Transport-Security, co chroni przed atakami XSS, clickjacking i innymi zagrożeniami web security.

**Komunikacja między serwisami** jest zabezpieczona poprzez współdzielony klucz JWT, który zapewnia, że wszystkie mikroserwisy mogą wzajemnie weryfikować tokeny. Baza danych PostgreSQL używa połączeń szyfrowanych i ściśle kontrolowanych uprawnień dostępu. Wszystkie dane wrażliwe, takie jak hasła i tokeny refresh, są odpowiednio hashowane i przechowywane bezpiecznie.

**Auditing i monitoring** są realizowane poprzez Spring Security Auditing, które automatycznie śledzi wszystkie operacje CRUD z informacjami o użytkowniku i czasie. System loguje wszystkie próby autentykacji, nieudane logowania i podejrzane aktywności. W środowisku produkcyjnym zaleca się dodatkowe narzędzia SIEM dla kompleksowego monitoringu bezpieczeństwa.

**Deployment security** obejmuje używanie zmiennych środowiskowych dla wszystkich wrażliwych danych, takich jak klucze JWT i dane dostępowe do bazy danych. Docker containery są uruchamiane z minimalnymi uprawnieniami, a w środowisku produkcyjnym zaleca się używanie HTTPS dla wszystkich połączeń. System jest przygotowany do pracy z reverse proxy (nginx) dla dodatkowej warstwy bezpieczeństwa i terminacji SSL.

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

## Łańcuch Filtrów Spring Security

### Kolejność i Opis Filtrów

Spring Security przetwarza każde żądanie HTTP przez sekwencję filtrów w ściśle określonej kolejności. Oto szczegółowy opis każdego filtru w systemie QuizApp:

#### 1. **DisableEncodeUrlFilter**
```
🎯 Funkcja: Wyłącza automatyczne kodowanie URL-i przez servlet container
⚙️ Działanie: Zapobiega dodawaniu jsessionid do URL-i w aplikacjach stateless
🔧 Zastosowanie: Utrzymanie czystości URL-i w REST API
📍 Pozycja: Pierwszy filtr w łańcuchu - przygotowuje żądanie
```

#### 2. **WebAsyncManagerIntegrationFilter**
```
🎯 Funkcja: Integracja Spring Security z asynchronicznym przetwarzaniem HTTP
⚙️ Działanie: Propaguje SecurityContext do asynchronicznych wątków
🔧 Zastosowanie: Zapewnia kontekst bezpieczeństwa w @Async metodach
📋 Scenariusz: Async controllers, CompletableFuture operations
```

#### 3. **SecurityContextHolderFilter**
```
🎯 Funkcja: Zarządzanie SecurityContext między żądaniami HTTP
⚙️ Działanie: Czyści SecurityContext po zakończeniu każdego żądania
🔧 Zastosowanie: Zapobiega wyciekom danych między sesjami użytkowników
🛡️ Bezpieczeństwo: Krityczny dla izolacji danych bezpieczeństwa
```

#### 4. **HeaderWriterFilter**
```
🎯 Funkcja: Automatyczne dodawanie nagłówków bezpieczeństwa do HTTP response
⚙️ Działanie: Wstrzykuje security headers do każdej odpowiedzi
🔧 Nagłówki: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
📋 Przykład: X-Content-Type-Options: nosniff, X-Frame-Options: DENY
```

#### 5. **CorsFilter**
```
🎯 Funkcja: Obsługa Cross-Origin Resource Sharing (CORS)
⚙️ Działanie: Waliduje żądania z różnych domen i dodaje CORS headers
🔧 Konfiguracja: Pozwala dostęp z React frontend (localhost:3000)
🌐 Metody: Obsługuje preflight OPTIONS requests
```

#### 6. **LogoutFilter**
```
🎯 Funkcja: Przetwarzanie żądań wylogowania użytkowników
⚙️ Działanie: Wykrywa żądania logout i wykonuje cleanup sesji/tokenów
🔧 Endpoint: Nasłuchuje na POST /api/auth/logout
🗂️ Cleanup: Usuwa refresh tokens z bazy danych
```

#### 7. **RateLimitingFilter** *(Custom - User Service)*
```
🎯 Funkcja: Ograniczanie liczby żądań na użytkownika/IP w określonym czasie
⚙️ Algorytm: Sliding window z wykorzystaniem Redis cache
🔧 Limity: 100 żądań/min (uwierzytelnieni), 20 żądań/min (anonimowi)
🛡️ Ochrona: Zapobiega atakom brute-force, DDoS i API abuse
⏱️ Okno: 60-sekundowe okno czasowe z automatycznym czyszczeniem
```

#### 8. **AntiPostmanFilter** *(Custom - Wyłączony)*
```
🎯 Funkcja: Blokowanie żądań z narzędzi API testing (Postman, Insomnia)
📊 Status: Obecnie WYŁĄCZONY w środowisku development
⚙️ Działanie: Analizuje User-Agent headers i wzorce żądań
🔧 Zastosowanie: Ochrona production API przed nieautoryzowanym testowaniem
🚫 Powód wyłączenia: Przeszkadzał w normalnej pracy z API
```

#### 9. **JwtAuthenticationFilter** *(Custom - Kluczowy)*
```
🎯 Funkcja: Główny filtr uwierzytelniania oparty na tokenach JWT
⚙️ Proces:
   • Ekstraktuje JWT z nagłówka Authorization: Bearer
   • Waliduje podpis cyfrowy i ważność czasową tokenu
   • Dekoduje claims (username, expiration, issued at)
   • Ustawia Authentication object w SecurityContext
🔧 Walidacja: HS512 signature, expiration time, token format
❌ Błędy: 401 Unauthorized przy nieprawidłowym/wygasłym tokenie
```

#### 10. **RequestCacheAwareFilter**
```
🎯 Funkcja: Zarządzanie cache'em żądań HTTP podczas procesów redirectów
⚙️ Działanie: Przechowuje żądania wykonane przed uwierzytelnieniem
🔧 Zastosowanie: Przekierowanie do pierwotnego URL po udanym logowaniu
📋 Scenariusz: Deep-linking do chronionych zasobów bez uwierzytelnienia
```

#### 11. **SecurityContextHolderAwareRequestFilter**
```
🎯 Funkcja: Wzbogacanie HttpServletRequest o Spring Security capabilities
⚙️ Działanie: Dodaje wrapper umożliwiający dostęp do SecurityContext
🔧 Metody: request.isUserInRole(), request.getRemoteUser(), request.getUserPrincipal()
📋 Użycie: Kompatybilność z standardowymi servlet security API
```

#### 12. **AnonymousAuthenticationFilter**
```
🎯 Funkcja: Tworzenie tokenów dla niezalogowanych użytkowników
⚙️ Działanie: Gdy brak uwierzytelnienia → tworzy AnonymousAuthenticationToken
🔧 Cel: Umożliwia jednolite przetwarzanie (authenticated/anonymous)
👤 Token: ROLE_ANONYMOUS z pseudo-username "anonymousUser"
```

#### 13. **SessionManagementFilter**
```
🎯 Funkcja: Zarządzanie strategią tworzenia i obsługi sesji HTTP
⚙️ Konfiguracja: STATELESS w QuizApp (brak sesji HTTP)
🔧 Działanie: Monitoruje session creation policy
🛡️ Bezpieczeństwo: Zapobiega session fixation attacks
```

#### 14. **ExceptionTranslationFilter**
```
🎯 Funkcja: Tłumaczenie wyjątków Spring Security na odpowiedzi HTTP
⚙️ Mapowanie:
   • AuthenticationException → 401 Unauthorized
   • AccessDeniedException → 403 Forbidden
   • InsufficientAuthenticationException → 401 + WWW-Authenticate
🔧 Entry Point: Rozpoczyna proces uwierzytelnienia przy błędach autoryzacji
```

#### 15. **AuthorizationFilter** *(Końcowy Decyzyjny)*
```
🎯 Funkcja: Końcowa weryfikacja uprawnień dostępu do chronionych zasobów
⚙️ Proces:
   • Sprawdza SecurityContext.getAuthentication()
   • Weryfikuje wymagane role/authorities dla endpoint
   • Porównuje user permissions z resource requirements
🔧 Konfiguracja: URL patterns, HTTP methods, @PreAuthorize adnotacje
✅ Sukces: Przekazuje żądanie do kontrolera aplikacji
❌ Błąd: 403 Forbidden - brak wymaganych uprawnień
```

### Mermaid Diagram - Filter Chain Flow

```mermaid
graph TD
    A[HTTP Request] --> B[DisableEncodeUrlFilter]
    B --> C[WebAsyncManagerIntegrationFilter]
    C --> D[SecurityContextHolderFilter]
    D --> E[HeaderWriterFilter]
    E --> F[CorsFilter]
    F --> G[LogoutFilter]
    G --> H[RateLimitingFilter]
    H --> I[AntiPostmanFilter - DISABLED]
    I --> J[JwtAuthenticationFilter]
    J --> K[RequestCacheAwareFilter]
    K --> L[SecurityContextHolderAwareRequestFilter]
    L --> M[AnonymousAuthenticationFilter]
    M --> N[SessionManagementFilter]
    N --> O[ExceptionTranslationFilter]
    O --> P[AuthorizationFilter]
    P --> Q[Application Controller]
    
    style H fill:#e1f5fe
    style J fill:#f3e5f5
    style I fill:#ffebee
    style P fill:#e8f5e8
```

### Konfiguracja Filter Chain

```java
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Podstawowa konfiguracja
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            
            // Konfiguracja autoryzacji
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            
            // Dodanie custom filtrów w odpowiedniej kolejności
            .addFilterBefore(rateLimitingFilter, JwtAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### Performance i Monitoring

```java
// Metrics dla każdego filtru
@Component
public class SecurityFilterMetrics {
    
    private final MeterRegistry meterRegistry;
    
    @EventListener
    public void handleFilterExecution(FilterExecutionEvent event) {
        Timer.Sample sample = Timer.start(meterRegistry);
        sample.stop(Timer.builder("security.filter.execution")
                .tag("filter", event.getFilterName())
                .tag("result", event.getResult())
                .register(meterRegistry));
    }
}
```

## Autentykacja JWT

### Konfiguracja JWT

**Wspólny klucz dla wszystkich mikroserwisów:**
```
MIkolajKrawczakJWTSecretKey2025SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny
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
        const clientSecret = 'MIkolajKrawczakClientSecret2025AntiPostmanProtectionAdvancedSecurity';
        
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
      APP_JWT_SECRET: "MIkolajKrawczakJWTSecretKey2025SuperBezpiecznyKluczDoTokenowMinimum256BitowKryptograficzny"
      
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
