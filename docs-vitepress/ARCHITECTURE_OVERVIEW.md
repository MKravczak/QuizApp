# Architektura QuizApp - Techniczny Przegląd

## 🏛 Wzorce Architektoniczne

### 🔧 Mikroserwisoewentowa Architektura

QuizApp została zaprojektowana zgodnie z zasadami **Domain-Driven Design (DDD)** i **Microservices Architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        QUIZAPP ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   CLIENT    │  │  API GATEWAY │  │    LOAD     │              │
│  │  (React)    │◄─┤  (Future)   │◄─┤  BALANCER   │              │
│  │ Port: 3000  │  │             │  │  (Future)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 MICROSERVICES LAYER                         ││
│  │                                                             ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐││
│  │ │    USER     │ │ FLASHCARD   │ │    QUIZ     │ │STATISTIC│││
│  │ │   SERVICE   │ │   SERVICE   │ │   SERVICE   │ │ SERVICE │││
│  │ │ Port: 8080  │ │ Port: 8081  │ │ Port: 8083  │ │Port:8084│││
│  │ │             │ │             │ │             │ │         │││
│  │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │┌──────┐ │││
│  │ │ │   JWT   │ │ │ │  CSV    │ │ │ │ INTER-  │ │ ││ANALYTICS│││
│  │ │ │ TOKENS  │ │ │ │ IMPORT  │ │ │ │SERVICE  │ │ ││ ENGINE │││
│  │ │ │         │ │ │ │         │ │ │ │   API   │ │ ││        │││
│  │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │└──────┘ │││
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                │                                │
│                                ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   DATA PERSISTENCE                          ││
│  │                                                             ││
│  │              ┌─────────────────────────┐                    ││
│  │              │      PostgreSQL 14      │                    ││
│  │              │                         │                    ││
│  │              │ ┌─────┐ ┌─────┐ ┌─────┐ │                    ││
│  │              │ │users│ │flash│ │quiz │ │                    ││
│  │              │ │     │ │cards│ │zes  │ │                    ││
│  │              │ └─────┘ └─────┘ └─────┘ │                    ││
│  │              │        ┌─────┐          │                    ││
│  │              │        │stats│          │                    ││
│  │              │        │     │          │                    ││
│  │              │        └─────┘          │                    ││
│  │              └─────────────────────────┘                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Domain-Driven Design (DDD)

### Bounded Contexts
Każdy mikroserwis reprezentuje oddzielny **Bounded Context**:

#### 1. **User Management Context** (User Service)
**Obszar odpowiedzialności**: Tożsamość i autoryzacja
- **Agregaty**: User, Role, Group, RefreshToken
- **Value Objects**: JwtToken, Username, Email
- **Domain Services**: AuthenticationService, AuthorizationService
- **Repository Pattern**: UserRepository, GroupRepository

```java
// Domain Model Example
@Entity
public class User {
    @Id private UserId id;
    @ValueObject private Username username;
    @ValueObject private Email email;
    private Set<Role> roles;
    private Set<Group> groups;
    
    // Biznesowa logika domeny
    public boolean hasRole(RoleName roleName) { /* ... */ }
    public boolean canAccessGroup(GroupId groupId) { /* ... */ }
}
```

#### 2. **Learning Content Context** (Flashcard Service)
**Obszar odpowiedzialności**: Materiały edukacyjne
- **Agregaty**: FlashcardDeck, Flashcard
- **Value Objects**: Term, Definition, ImagePath
- **Domain Services**: ImportService, FileValidationService

#### 3. **Assessment Context** (Quiz Service)
**Obszar odpowiedzialności**: Testy i oceny
- **Agregaty**: Quiz, QuizQuestion, QuizResult
- **Value Objects**: Question, Answer, Score
- **Domain Services**: QuizEvaluationService, AccessControlService

#### 4. **Analytics Context** (Statistics Service)
**Obszar odpowiedzialności**: Analiza danych i raportowanie
- **Agregaty**: QuizStatistics
- **Value Objects**: Score, Percentage, TimeSpent
- **Domain Services**: AnalyticsService, ReportingService

---

## 🔄 Wzorce Projektowe

### 1. **Repository Pattern**
Abstrakcja dostępu do danych:

```java
// Interface Repository
public interface UserRepository {
    Optional<User> findById(UserId id);
    Optional<User> findByUsername(Username username);
    User save(User user);
    void delete(UserId id);
}

// Implementacja JPA
@Repository
public class JpaUserRepository implements UserRepository {
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public Optional<User> findById(UserId id) {
        return Optional.ofNullable(
            entityManager.find(User.class, id.getValue())
        );
    }
}
```

### 2. **Factory Pattern**
Tworzenie złożonych obiektów:

```java
@Component
public class QuizFactory {
    
    public Quiz createQuiz(CreateQuizRequest request, UserId userId) {
        Quiz quiz = Quiz.builder()
            .name(request.getName())
            .description(request.getDescription())
            .userId(userId)
            .isPublic(request.isPublic())
            .build();
            
        // Dodanie pytań
        request.getQuestions().forEach(q -> 
            quiz.addQuestion(createQuestion(q))
        );
        
        return quiz;
    }
    
    private QuizQuestion createQuestion(QuestionRequest request) {
        return QuizQuestion.builder()
            .questionText(request.getQuestionText())
            .questionType(QuestionType.valueOf(request.getType()))
            .correctAnswer(request.getCorrectAnswer())
            .options(createOptions(request))
            .build();
    }
}
```

### 3. **Strategy Pattern**
Różne strategie importu fiszek:

```java
public interface ImportStrategy {
    List<Flashcard> importFlashcards(MultipartFile file);
}

@Component
public class CsvImportStrategy implements ImportStrategy {
    @Override
    public List<Flashcard> importFlashcards(MultipartFile file) {
        // Logika importu CSV
    }
}

@Component 
public class TxtImportStrategy implements ImportStrategy {
    @Override
    public List<Flashcard> importFlashcards(MultipartFile file) {
        // Logika importu TXT
    }
}

@Service
public class ImportService {
    private final Map<String, ImportStrategy> strategies;
    
    public List<Flashcard> importFile(MultipartFile file) {
        String extension = getFileExtension(file.getOriginalFilename());
        ImportStrategy strategy = strategies.get(extension);
        return strategy.importFlashcards(file);
    }
}
```

### 4. **Command Pattern**
Obsługa operacji biznesowych:

```java
public interface Command<T> {
    T execute();
}

@Component
public class CreateQuizCommand implements Command<QuizDto> {
    private final CreateQuizRequest request;
    private final QuizFactory quizFactory;
    private final QuizRepository quizRepository;
    
    @Override
    public QuizDto execute() {
        Quiz quiz = quizFactory.createQuiz(request, getCurrentUserId());
        Quiz savedQuiz = quizRepository.save(quiz);
        return QuizMapper.toDto(savedQuiz);
    }
}

@Service
public class CommandExecutor {
    public <T> T execute(Command<T> command) {
        // Możliwość dodania: logging, validation, transactions
        return command.execute();
    }
}
```

### 5. **Observer Pattern**
Synchronizacja danych między serwisami:

```java
@EventListener
@Component
public class QuizResultEventHandler {
    
    private final StatisticsServiceClient statisticsClient;
    
    @EventListener
    public void handleQuizCompleted(QuizCompletedEvent event) {
        // Wysłanie wyniku do serwisu statystyk
        statisticsClient.submitResult(event.getQuizResult());
    }
}

@Service
public class QuizService {
    
    private final ApplicationEventPublisher eventPublisher;
    
    public QuizResultDto submitQuizResult(SubmitQuizResultRequest request) {
        QuizResult result = processQuizResult(request);
        
        // Publikacja wydarzenia
        eventPublisher.publishEvent(
            new QuizCompletedEvent(result)
        );
        
        return QuizResultMapper.toDto(result);
    }
}
```

---

## 🔐 Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. ┌─────────────────────────────────────────────────────┐  │
│    │            NETWORK SECURITY                         │  │
│    │  • CORS Configuration                               │  │
│    │  • Rate Limiting (50 req/min)                      │  │
│    │  • Anti-Automation Protection                      │  │
│    └─────────────────────────────────────────────────────┘  │
│                              │                              │
│ 2. ┌─────────────────────────────────────────────────────┐  │
│    │          AUTHENTICATION                             │  │
│    │  • JWT Tokens (HS512)                              │  │
│    │  • Refresh Token Rotation                          │  │
│    │  • Secure Password Hashing (BCrypt)               │  │
│    └─────────────────────────────────────────────────────┘  │
│                              │                              │
│ 3. ┌─────────────────────────────────────────────────────┐  │
│    │           AUTHORIZATION                             │  │
│    │  • Role-Based Access Control (RBAC)               │  │
│    │  • Method-Level Security (@PreAuthorize)          │  │
│    │  • Resource Ownership Validation                   │  │
│    └─────────────────────────────────────────────────────┘  │
│                              │                              │
│ 4. ┌─────────────────────────────────────────────────────┐  │
│    │            DATA SECURITY                            │  │
│    │  • Input Validation (Bean Validation)             │  │
│    │  • SQL Injection Prevention (JPA)                 │  │
│    │  • XSS Protection                                  │  │
│    │  • File Upload Validation                          │  │
│    └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### JWT Token Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CLIENT    │    │ USER SERVICE│    │OTHER SERVICES│
│  (React)    │    │ (Port 8080) │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
   1.  │ POST /auth/login  │                   │
       ├──────────────────►│                   │
       │  {username, pwd}  │                   │
       │                   │                   │
   2.  │ JWT + RefreshToken│                   │
       │◄──────────────────┤                   │
       │                   │                   │
   3.  │ GET /api/resource │                   │
       │ + Bearer JWT      ├──────────────────►│
       │                   │ X-User-ID: userId │
       │                   │                   │
   4.  │                   │   Resource Data   │
       │◄──────────────────┼───────────────────┤
       │                   │                   │
   5.  │ POST /refresh     │                   │
       ├──────────────────►│                   │
       │ {refreshToken}    │                   │
       │                   │                   │
   6.  │ New JWT + Refresh │                   │
       │◄──────────────────┤                   │
```

---

## 📊 Data Flow Architecture

### Create Quiz Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ REACT   │    │ USER    │    │ QUIZ    │    │ STATS   │
│ CLIENT  │    │ SERVICE │    │ SERVICE │    │ SERVICE │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
 1.  │ Create Quiz  │              │              │
     ├─────────────►│              │              │
     │              │              │              │
 2.  │              │ Validate JWT │              │
     │              ├─────────────►│              │
     │              │              │              │
 3.  │              │              │ Save Quiz    │
     │              │              ├─────────────►│
     │              │              │   to DB      │
     │              │              │              │
 4.  │              │              │ Quiz Created │
     │              │◄─────────────┤              │
     │              │              │              │
 5.  │ Success      │              │              │
     │◄─────────────┤              │              │
```

### Quiz Submission Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ REACT   │    │ QUIZ    │    │ STATS   │    │DATABASE │
│ CLIENT  │    │ SERVICE │    │ SERVICE │    │(PgSQL)  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
 1.  │Submit Answers│              │              │
     ├─────────────►│              │              │
     │              │              │              │
 2.  │              │ Calculate    │              │
     │              │ Score        │              │
     │              │              │              │
 3.  │              │ Save Result  │              │
     │              ├─────────────────────────────►│
     │              │              │              │
 4.  │              │ Sync Stats   │              │
     │              ├─────────────►│              │
     │              │              │              │
 5.  │              │              │ Store Stats  │
     │              │              ├─────────────►│
     │              │              │              │
 6.  │ Quiz Result  │              │              │
     │◄─────────────┤              │              │
     │              │              │              │
 7.  │ GET /stats   │              │              │
     ├─────────────────────────────┤              │
     │              │              │              │
 8.  │ Statistics   │              │              │
     │◄─────────────────────────────┤              │
```

---

## 🔧 Configuration Management

### Application Profiles

```yaml
# application.yml (Base Configuration)
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}

# application-dev.yml (Development)
app:
  security:
    anti-postman:
      enabled: false  # Wyłączone dla dev
    rate-limit:
      enabled: false
  jwt:
    expiration: 86400000  # 24h

# application-prod.yml (Production)
app:
  security:
    anti-postman:
      enabled: true   # Włączone dla prod
    rate-limit:
      enabled: true
      max-requests: 100
  jwt:
    expiration: 3600000   # 1h

# application-test.yml (Testing)
app:
  security:
    anti-postman:
      enabled: false
    rate-limit:
      enabled: false
```

### Environment Variables

```bash
# Docker Compose Environment
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/quizapp
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

APP_JWT_SECRET=MIkolajKrawczakJWTSecretKey2025
APP_SECURITY_ANTI_POSTMAN_ENABLED=true

# Service Discovery (Future)
EUREKA_CLIENT_SERVICE_URL=http://eureka-server:8761/eureka
```

---

## 📈 Monitoring i Observability

### Health Checks

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    private final UserRepository userRepository;
    
    @Override
    public Health health() {
        try {
            long userCount = userRepository.count();
            return Health.up()
                .withDetail("users", userCount)
                .withDetail("database", "accessible")
                .build();
        } catch (Exception e) {
            return Health.down(e)
                .withDetail("database", "inaccessible")
                .build();
        }
    }
}
```

### Metrics Collection

```java
@Service
public class MetricsService {
    
    private final MeterRegistry meterRegistry;
    
    @EventListener
    public void handleQuizCompleted(QuizCompletedEvent event) {
        // Counter dla ukończonych quizów
        Counter.builder("quiz.completed")
            .tag("service", "quiz-service")
            .register(meterRegistry)
            .increment();
            
        // Gauge dla średniego wyniku
        Gauge.builder("quiz.average.score")
            .tag("quiz_id", event.getQuizId().toString())
            .register(meterRegistry, () -> calculateAverageScore(event.getQuizId()));
    }
}
```

---

## 🚀 Deployment Architecture

### Container Orchestration

```yaml
# docker-compose.yml (Current)
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: quizapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      
  user-service:
    build: ./user-service
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: docker
      
  # ... other services
```

### Future Kubernetes Deployment

```yaml
# k8s-deployment.yml (Future)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: quizapp/user-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "kubernetes"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
```

---

## 🔄 CI/CD Pipeline (Future)

### GitLab CI Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - security-scan
  - deploy

variables:
  DOCKER_REGISTRY: "registry.gitlab.com/quizapp"

test:
  stage: test
  script:
    - ./mvnw test
    - npm test
  coverage: '/Code coverage: \d+\.\d+%/'
  
build:
  stage: build
  script:
    - docker build -t $DOCKER_REGISTRY/user-service:$CI_COMMIT_SHA ./user-service
    - docker push $DOCKER_REGISTRY/user-service:$CI_COMMIT_SHA
    
security-scan:
  stage: security-scan
  script:
    - docker run --rm -v $(pwd):/app sonarqube/sonar-scanner-cli
    - trivy image $DOCKER_REGISTRY/user-service:$CI_COMMIT_SHA

deploy-staging:
  stage: deploy
  environment:
    name: staging
  script:
    - kubectl apply -f k8s/staging/
    - kubectl set image deployment/user-service user-service=$DOCKER_REGISTRY/user-service:$CI_COMMIT_SHA
```

---

## 📊 Performance Considerations

### Database Optimization

1. **Connection Pooling** (HikariCP)
2. **Read Replicas** dla serwisu statystyk
3. **Indexing Strategy** dla często używanych zapytań
4. **Query Optimization** z EXPLAIN ANALYZE
5. **Partitioning** dla dużych tabel statystyk

### Caching Strategy

```java
@Cacheable(value = "quizzes", key = "#quizId")
public QuizDto getQuizById(Long quizId) {
    // Expensive database operation
}

@CacheEvict(value = "quizzes", key = "#quiz.id")
public QuizDto updateQuiz(QuizDto quiz) {
    // Update operation
}
```

### Load Balancing (Future)

```nginx
# nginx.conf
upstream user-service {
    server user-service-1:8080;
    server user-service-2:8080;
    server user-service-3:8080;
}

upstream quiz-service {
    server quiz-service-1:8083;
    server quiz-service-2:8083;
}

server {
    listen 80;
    location /api/auth {
        proxy_pass http://user-service;
    }
    location /api/quizzes {
        proxy_pass http://quiz-service;
    }
}
```

---

## 🎯 Skalowalność

### Horizontal Scaling

- **Stateless Services** - wszystkie serwisy są bezstanowe
- **Database Separation** - każdy serwis ma własny schemat
- **Load Balancing Ready** - przygotowane na rozłożenie obciążenia
- **Container Orchestration** - gotowe na Kubernetes

### Vertical Scaling

- **JVM Tuning** dla lepszej wydajności
- **Connection Pool Optimization**
- **Memory Management** z właściwymi GC settings

QuizApp została zaprojektowana z myślą o skalowalności, maintainability i najlepszych praktykach enterprise Java development. 