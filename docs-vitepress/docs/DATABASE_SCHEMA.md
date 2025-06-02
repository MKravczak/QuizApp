# Database Schema - Szczegółowa Dokumentacja

## 🗄 Architektura Bazy Danych

### 📊 Filozofia Podziału na Schematy

QuizApp wykorzystuje PostgreSQL 14 z wieloschematową architekturą, która odzwierciedla podział na mikroserwisy. Każdy mikroserwis ma własny schema, co zapewnia:

**🎯 Separation of Concerns:**
- Każdy schema zawiera tabele odpowiadające jednemu bounded context
- Brak bezpośrednich referencji między schematami (loose coupling)
- Możliwość niezależnego rozwoju każdego domeny biznesowej

**🔒 Izolacja Danych:**
- Każdy mikroserwis ma dostęp tylko do swojego schematu
- Brak przypadkowych krzyżowych zapytań między domenami  
- Łatwiejsze zarządzanie uprawnieniami na poziomie schematu

**📈 Skalowalność:**
- Możliwość przeniesienia każdego schematu do osobnej bazy danych
- Przygotowanie pod database per microservice pattern
- Elastyczne skalowanie według potrzeb każdej domeny

**🛠 Maintenance:**
- Niezależne migracje dla każdego schematu
- Prostsze backup i restore per domena
- Czytelna struktura dla deweloperów

### 🏗 Przegląd Schematów

```sql
-- Inicjalizacja schematów według domen biznesowych
CREATE SCHEMA IF NOT EXISTS users;       -- Domena uwierzytelniania i autoryzacji
CREATE SCHEMA IF NOT EXISTS flashcards;  -- Domena fiszek edukacyjnych
CREATE SCHEMA IF NOT EXISTS quizzes;     -- Domena quizów i testów
CREATE SCHEMA IF NOT EXISTS statistics;  -- Domena analityki i raportowania
```

### 📋 Lista Wszystkich Tabel w Systemie

#### 👤 Schema: users (User Service)
- **users** - Główna tabela użytkowników systemu
- **roles** - Systemowe role (ROLE_USER, ROLE_ADMIN) 
- **user_roles** - Powiązania użytkowników z rolami (Many-to-Many)
- **groups** - Grupy użytkowników (klasy, zespoły)
- **group_members** - Członkowie grup (Many-to-Many)
- **refresh_tokens** - Tokeny odświeżania JWT

#### 📚 Schema: flashcards (Flashcard Service)
- **flashcard_decks** - Zestawy fiszek
- **flashcards** - Pojedyncze fiszki (pytanie/odpowiedź)

#### 🧠 Schema: quizzes (Quiz Service)
- **quizzes** - Główna tabela quizów
- **quiz_groups** - Powiązania quizów z grupami (Many-to-Many)
- **quiz_questions** - Pytania w quizach
- **quiz_results** - Wyniki rozwiązanych quizów

#### 📊 Schema: statistics (Statistics Service)
- **quiz_statistics** - Agregowane statystyki quizów

**Łącznie: 12 tabel w 4 schematach biznesowych**

### 🔗 Komunikacja Między Schematami

System implementuje **Database per Microservice** pattern z luźnym sprzężeniem:

- **Brak Foreign Keys między schematami** - każdy mikroserwis zarządza swoimi danymi
- **Komunikacja przez User ID** - referencje do users.users(id) przechowywane jako BIGINT
- **Eventual Consistency** - dane są synchronizowane przez API calls między serwisami
- **Shared Nothing Architecture** - każdy schema jest kompletnie niezależny

### 🛡 Bezpieczeństwo na Poziomie Bazy

```sql
-- Przykład konfiguracji uprawnień per mikroserwis
CREATE USER user_service_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON SCHEMA users TO user_service_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA users TO user_service_user;

CREATE USER flashcard_service_user WITH PASSWORD 'secure_password';  
GRANT ALL PRIVILEGES ON SCHEMA flashcards TO flashcard_service_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA flashcards TO flashcard_service_user;

-- Podobnie dla quiz_service_user i statistics_service_user
```

---

## 📋 Szczegółowe Opisy Tabel

### 👤 Schema: users

#### Tabela: users
**Opis**: Główna tabela użytkowników systemu

```sql
CREATE TABLE users.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL, -- BCrypt hash
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT users_username_length CHECK (LENGTH(username) >= 3),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indeksy dla szybkiego wyszukiwania
CREATE INDEX idx_users_username ON users.users(username);
CREATE INDEX idx_users_email ON users.users(email);
CREATE INDEX idx_users_created_at ON users.users(created_at);
```

**Przykładowe dane**:
```sql
INSERT INTO users.users (username, email, password, first_name, last_name) VALUES
('admin', 'admin@quizapp.com', '$2a$12$encrypted_password_hash', 'Admin', 'User'),
('user1', 'user1@student.com', '$2a$12$encrypted_password_hash', 'Jan', 'Kowalski'),
('student1', 'student@school.com', '$2a$12$encrypted_password_hash', 'Anna', 'Nowak');
```

---

### Tabela: roles
**Opis**: Systemowe role użytkowników

```sql
CREATE TABLE users.roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Inicjalizacja domyślnych ról
INSERT INTO users.roles (name) VALUES 
('ROLE_USER'), 
('ROLE_ADMIN');
```

**Role systemowe**:
- `ROLE_USER` - standardowy użytkownik (może tworzyć quizy i fiszki)
- `ROLE_ADMIN` - administrator (pełny dostęp do systemu)

---

### Tabela: user_roles (Many-to-Many)
**Opis**: Powiązania użytkowników z rolami

```sql
CREATE TABLE users.user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users.users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES users.roles(id) ON DELETE CASCADE
);

-- Indeks dla szybkich zapytań o role użytkownika
CREATE INDEX idx_user_roles_user_id ON users.user_roles(user_id);
```

---

### Tabela: groups
**Opis**: Grupy użytkowników (klasy, zespoły)

```sql
CREATE TABLE users.groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (created_by) REFERENCES users.users(id) ON DELETE SET NULL
);

-- Indeksy
CREATE INDEX idx_groups_name ON users.groups(name);
CREATE INDEX idx_groups_created_by ON users.groups(created_by);
```

**Przykładowe dane**:
```sql
INSERT INTO users.groups (name, description, created_by) VALUES
('Klasa 3A', 'Uczniowie klasy 3A matematyczno-fizycznej', 1),
('Nauczyciele Matematyki', 'Grupa nauczycieli przedmiotów ścisłych', 1),
('Kurs Programowania', 'Studenci kursu Java Spring Boot', 1);
```

---

### Tabela: group_members (Many-to-Many)
**Opis**: Członkowie grup

```sql
CREATE TABLE users.group_members (
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT NOW(),
    added_by BIGINT,
    
    PRIMARY KEY (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES users.groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users.users(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users.users(id) ON DELETE SET NULL
);

-- Indeksy dla szybkich zapytań
CREATE INDEX idx_group_members_group_id ON users.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON users.group_members(user_id);
```

---

### Tabela: refresh_tokens
**Opis**: Tokeny odświeżania JWT

```sql
CREATE TABLE users.refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users.users(id) ON DELETE CASCADE
);

-- Indeksy
CREATE INDEX idx_refresh_tokens_user_id ON users.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON users.refresh_tokens(expires_at);

-- Automatyczne czyszczenie wygasłych tokenów
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM users.refresh_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 📚 Schema: flashcards

### Tabela: flashcard_decks
**Opis**: Zestawy fiszek

```sql
CREATE TABLE flashcards.flashcard_decks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT flashcard_decks_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Indeksy
CREATE INDEX idx_flashcard_decks_user_id ON flashcards.flashcard_decks(user_id);
CREATE INDEX idx_flashcard_decks_is_public ON flashcards.flashcard_decks(is_public);
CREATE INDEX idx_flashcard_decks_created_at ON flashcards.flashcard_decks(created_at);

-- Partial index dla publicznych zestawów
CREATE INDEX idx_flashcard_decks_public_name ON flashcards.flashcard_decks(name) 
WHERE is_public = true;
```

**Przykładowe dane**:
```sql
INSERT INTO flashcards.flashcard_decks (name, description, user_id, is_public) VALUES
('Angielski - Podstawy', 'Podstawowe słówka angielskie dla początkujących', 2, true),
('Matematyka - Wzory', 'Najważniejsze wzory matematyczne', 2, false),
('Historia - Daty', 'Ważne daty w historii Polski', 3, true);
```

---

### Tabela: flashcards
**Opis**: Pojedyncze fiszki w zestawach

```sql
CREATE TABLE flashcards.flashcards (
    id BIGSERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    image_path VARCHAR(255), -- Ścieżka do obrazu (opcjonalnie)
    deck_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (deck_id) REFERENCES flashcards.flashcard_decks(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT flashcards_term_not_empty CHECK (LENGTH(TRIM(term)) > 0),
    CONSTRAINT flashcards_definition_not_empty CHECK (LENGTH(TRIM(definition)) > 0)
);

-- Indeksy
CREATE INDEX idx_flashcards_deck_id ON flashcards.flashcards(deck_id);
CREATE INDEX idx_flashcards_term ON flashcards.flashcards(term);

-- Full-text search dla wyszukiwania w fıszkach
CREATE INDEX idx_flashcards_search ON flashcards.flashcards 
USING gin(to_tsvector('english', term || ' ' || definition));
```

**Przykładowe dane**:
```sql
INSERT INTO flashcards.flashcards (term, definition, deck_id) VALUES
('apple', 'jabłko - owoc rosnący na jabłoni', 1),
('car', 'samochód - pojazd mechaniczny', 1),
('book', 'książka - zbiór kart z tekstem', 1),
('a² + b² = c²', 'Twierdzenie Pitagorasa dla trójkąta prostokątnego', 2);
```

---

## 🧠 Schema: quizzes

### Tabela: quizzes
**Opis**: Quizy edukacyjne

```sql
CREATE TABLE quizzes.quizzes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    is_public BOOLEAN DEFAULT FALSE,
    question_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT quizzes_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT quizzes_question_count_positive CHECK (question_count >= 0)
);

-- Indeksy
CREATE INDEX idx_quizzes_user_id ON quizzes.quizzes(user_id);
CREATE INDEX idx_quizzes_is_public ON quizzes.quizzes(is_public);
CREATE INDEX idx_quizzes_created_at ON quizzes.quizzes(created_at);

-- Partial index dla publicznych quizów
CREATE INDEX idx_quizzes_public_name ON quizzes.quizzes(name) 
WHERE is_public = true;
```

---

### Tabela: quiz_groups
**Opis**: Dostęp grupowy do quizów

```sql
CREATE TABLE quizzes.quiz_groups (
    quiz_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL, -- Reference do users.groups(id)
    
    PRIMARY KEY (quiz_id, group_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes.quizzes(id) ON DELETE CASCADE
);

-- Indeksy
CREATE INDEX idx_quiz_groups_quiz_id ON quizzes.quiz_groups(quiz_id);
CREATE INDEX idx_quiz_groups_group_id ON quizzes.quiz_groups(group_id);
```

---

### Tabela: quiz_questions
**Opis**: Pytania w quizach

```sql
CREATE TABLE quizzes.quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL, -- 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'OPEN_ENDED'
    correct_answer TEXT NOT NULL,
    option_a VARCHAR(255), -- Opcje dla MULTIPLE_CHOICE
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    points INTEGER DEFAULT 1,
    question_order INTEGER, -- Kolejność pytania w quizie
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes.quizzes(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT quiz_questions_text_not_empty CHECK (LENGTH(TRIM(question_text)) > 0),
    CONSTRAINT quiz_questions_type_valid CHECK (
        question_type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'OPEN_ENDED')
    ),
    CONSTRAINT quiz_questions_points_positive CHECK (points > 0),
    CONSTRAINT quiz_questions_multiple_choice_options CHECK (
        question_type != 'MULTIPLE_CHOICE' OR 
        (option_a IS NOT NULL AND option_b IS NOT NULL)
    )
);

-- Indeksy
CREATE INDEX idx_quiz_questions_quiz_id ON quizzes.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_type ON quizzes.quiz_questions(question_type);
CREATE INDEX idx_quiz_questions_order ON quizzes.quiz_questions(quiz_id, question_order);
```

**Przykładowe dane**:
```sql
INSERT INTO quizzes.quiz_questions 
(quiz_id, question_text, question_type, correct_answer, option_a, option_b, option_c, option_d, points, question_order) 
VALUES
(1, 'Ile to 2 + 2?', 'MULTIPLE_CHOICE', '4', '3', '4', '5', '6', 1, 1),
(1, 'Czy 5 > 3?', 'TRUE_FALSE', 'true', NULL, NULL, NULL, NULL, 1, 2),
(1, 'Podaj wzór na pole koła', 'OPEN_ENDED', 'π×r²', NULL, NULL, NULL, NULL, 2, 3);
```

---

### Tabela: quiz_results
**Opis**: Wyniki rozwiązanych quizów

```sql
CREATE TABLE quizzes.quiz_results (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_questions > 0 THEN (score * 100.0 / total_questions)
            ELSE 0 
        END
    ) STORED,
    time_spent_seconds INTEGER, -- Czas rozwiązywania w sekundach
    completed_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes.quizzes(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT quiz_results_score_valid CHECK (score >= 0 AND score <= total_questions),
    CONSTRAINT quiz_results_total_positive CHECK (total_questions > 0),
    CONSTRAINT quiz_results_time_positive CHECK (time_spent_seconds IS NULL OR time_spent_seconds >= 0)
);

-- Indeksy
CREATE INDEX idx_quiz_results_quiz_id ON quizzes.quiz_results(quiz_id);
CREATE INDEX idx_quiz_results_user_id ON quizzes.quiz_results(user_id);
CREATE INDEX idx_quiz_results_completed_at ON quizzes.quiz_results(completed_at);
CREATE INDEX idx_quiz_results_percentage ON quizzes.quiz_results(percentage);

-- Composite index dla najczęstszych zapytań
CREATE INDEX idx_quiz_results_user_quiz ON quizzes.quiz_results(user_id, quiz_id, completed_at);
```

---

## 📊 Schema: statistics

### Tabela: quiz_statistics
**Opis**: Statystyki wyników quizów (kopia dla serwisu statystyk)

```sql
CREATE TABLE statistics.quiz_statistics (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL, -- Reference do quizzes.quizzes(id)
    quiz_name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL, -- Reference do users.users(id)
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_questions > 0 THEN (score * 100.0 / total_questions)
            ELSE 0 
        END
    ) STORED,
    time_spent_seconds INTEGER,
    completed_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT quiz_statistics_score_valid CHECK (score >= 0 AND score <= total_questions),
    CONSTRAINT quiz_statistics_total_positive CHECK (total_questions > 0)
);

-- Indeksy dla analityki
CREATE INDEX idx_quiz_statistics_user_id ON statistics.quiz_statistics(user_id);
CREATE INDEX idx_quiz_statistics_quiz_id ON statistics.quiz_statistics(quiz_id);
CREATE INDEX idx_quiz_statistics_completed_at ON statistics.quiz_statistics(completed_at);
CREATE INDEX idx_quiz_statistics_percentage ON statistics.quiz_statistics(percentage);

-- Composite indeksy dla raportów
CREATE INDEX idx_quiz_statistics_user_month ON statistics.quiz_statistics(
    user_id, 
    DATE_TRUNC('month', completed_at)
);

CREATE INDEX idx_quiz_statistics_quiz_stats ON statistics.quiz_statistics(
    quiz_id, 
    percentage, 
    completed_at
);
```

---

## 🔧 Views i Funkcje

### View: user_statistics
**Opis**: Widok z podsumowaniem statystyk użytkownika

```sql
CREATE VIEW statistics.user_statistics AS
SELECT 
    user_id,
    COUNT(*) as total_quizzes_taken,
    AVG(percentage) as average_percentage,
    MAX(percentage) as best_percentage,
    MIN(percentage) as worst_percentage,
    COUNT(CASE WHEN percentage >= 80 THEN 1 END) as quizzes_passed,
    AVG(time_spent_seconds) as average_time_seconds,
    MAX(completed_at) as last_quiz_date
FROM statistics.quiz_statistics
GROUP BY user_id;
```

### View: quiz_analytics
**Opis**: Widok z analityką quizów

```sql
CREATE VIEW statistics.quiz_analytics AS
SELECT 
    qs.quiz_id,
    qs.quiz_name,
    COUNT(*) as total_attempts,
    AVG(qs.percentage) as average_score,
    STDDEV(qs.percentage) as score_deviation,
    COUNT(DISTINCT qs.user_id) as unique_users,
    MIN(qs.completed_at) as first_attempt,
    MAX(qs.completed_at) as last_attempt
FROM statistics.quiz_statistics qs
GROUP BY qs.quiz_id, qs.quiz_name;
```

### Funkcja: get_user_progress
**Opis**: Funkcja zwracająca postęp użytkownika w czasie

```sql
CREATE OR REPLACE FUNCTION statistics.get_user_progress(
    p_user_id BIGINT,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
    date DATE,
    quizzes_count INTEGER,
    average_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(completed_at) as date,
        COUNT(*)::INTEGER as quizzes_count,
        AVG(percentage) as average_score
    FROM statistics.quiz_statistics
    WHERE user_id = p_user_id 
      AND completed_at >= CURRENT_DATE - INTERVAL '%s days'
    GROUP BY DATE(completed_at)
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔒 Security i Permissions

### Row Level Security (RLS)
**Implementacja zabezpieczeń na poziomie wierszy**

```sql
-- Włączenie RLS dla tabel użytkowników
ALTER TABLE users.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes.quizzes ENABLE ROW LEVEL SECURITY;

-- Polityka dostępu do własnych danych
CREATE POLICY users_own_data ON users.users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::bigint);

-- Polityka dostępu do fiszek
CREATE POLICY flashcard_decks_access ON flashcards.flashcard_decks
    FOR SELECT
    USING (
        is_public = true OR 
        user_id = current_setting('app.current_user_id')::bigint
    );

-- Polityka modyfikacji własnych fiszek
CREATE POLICY flashcard_decks_modify ON flashcards.flashcard_decks
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::bigint);
```

---

## 📈 Performance Optimization

### Materialized Views dla raportów

```sql
-- Materialized view dla dashboard
CREATE MATERIALIZED VIEW statistics.dashboard_stats AS
SELECT 
    DATE(completed_at) as date,
    COUNT(*) as total_quizzes,
    COUNT(DISTINCT user_id) as active_users,
    AVG(percentage) as average_score
FROM statistics.quiz_statistics
WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(completed_at);

-- Refresh codziennie o północy
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW statistics.dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Scheduled job (wymaga pg_cron extension)
SELECT cron.schedule('refresh-dashboard', '0 0 * * *', 'SELECT refresh_dashboard_stats();');
```

### Partycjonowanie tabeli quiz_statistics

```sql
-- Partycjonowanie po dacie dla lepszej wydajności
CREATE TABLE statistics.quiz_statistics_partitioned (
    LIKE statistics.quiz_statistics INCLUDING ALL
) PARTITION BY RANGE (completed_at);

-- Partycje miesięczne
CREATE TABLE statistics.quiz_statistics_y2024m01 
PARTITION OF statistics.quiz_statistics_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE statistics.quiz_statistics_y2024m02 
PARTITION OF statistics.quiz_statistics_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

---

## 🔄 Database Triggers

### Trigger: update_question_count
**Automatyczne aktualizowanie liczby pytań w quizie**

```sql
CREATE OR REPLACE FUNCTION update_quiz_question_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quizzes.quizzes 
    SET question_count = (
        SELECT COUNT(*) 
        FROM quizzes.quiz_questions 
        WHERE quiz_id = COALESCE(NEW.quiz_id, OLD.quiz_id)
    )
    WHERE id = COALESCE(NEW.quiz_id, OLD.quiz_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_count
    AFTER INSERT OR DELETE ON quizzes.quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_question_count();
```

### Trigger: sync_statistics
**Synchronizacja wyników do serwisu statystyk**

```sql
CREATE OR REPLACE FUNCTION sync_quiz_results_to_statistics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO statistics.quiz_statistics 
    (quiz_id, quiz_name, user_id, score, total_questions, time_spent_seconds, completed_at)
    SELECT 
        NEW.quiz_id,
        q.name,
        NEW.user_id,
        NEW.score,
        NEW.total_questions,
        NEW.time_spent_seconds,
        NEW.completed_at
    FROM quizzes.quizzes q
    WHERE q.id = NEW.quiz_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_statistics
    AFTER INSERT ON quizzes.quiz_results
    FOR EACH ROW
    EXECUTE FUNCTION sync_quiz_results_to_statistics();
```

---

## 🛠 Maintenance Scripts

### Skrypt czyszczący stare dane

```sql
-- Funkcja czyszcząca stare tokeny i logi
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Usuń wygasłe refresh tokeny
    DELETE FROM users.refresh_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    -- Usuń stare wyniki quizów (starsze niż 2 lata)
    DELETE FROM statistics.quiz_statistics 
    WHERE completed_at < NOW() - INTERVAL '2 years';
    
    -- Vacuum dla odzyskania miejsca
    VACUUM ANALYZE;
    
    RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;
```

### Backup Script

```sql
-- Tworzenie backupu ważnych danych
CREATE OR REPLACE FUNCTION create_backup_snapshot()
RETURNS void AS $$
BEGIN
    -- Eksport użytkowników i ról
    COPY (
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
               array_agg(r.name) as roles
        FROM users.users u
        LEFT JOIN users.user_roles ur ON u.id = ur.user_id
        LEFT JOIN users.roles r ON ur.role_id = r.id
        GROUP BY u.id, u.username, u.email, u.first_name, u.last_name
    ) TO '/tmp/users_backup.csv' WITH CSV HEADER;
    
    -- Eksport statystyk
    COPY statistics.quiz_statistics 
    TO '/tmp/statistics_backup.csv' WITH CSV HEADER;
    
    RAISE NOTICE 'Backup created at %', NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Monitoring Queries

### Popularne zapytania do monitorowania

```sql
-- Top 10 najaktywniejszych użytkowników
SELECT 
    u.username,
    COUNT(qs.id) as quizzes_taken,
    AVG(qs.percentage) as avg_score
FROM statistics.quiz_statistics qs
JOIN users.users u ON qs.user_id = u.id
WHERE qs.completed_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.username
ORDER BY quizzes_taken DESC
LIMIT 10;

-- Najpopularniejsze quizy
SELECT 
    qs.quiz_name,
    COUNT(*) as attempts,
    AVG(qs.percentage) as avg_score,
    COUNT(DISTINCT qs.user_id) as unique_users
FROM statistics.quiz_statistics qs
WHERE qs.completed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY qs.quiz_id, qs.quiz_name
ORDER BY attempts DESC
LIMIT 10;

-- Statystyki wydajności bazy
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Ta dokumentacja przedstawia kompletną strukturę bazy danych QuizApp z wszystkimi tabelami, relacjami, indeksami, triggerami i funkcjami pomocniczymi. 