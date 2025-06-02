# QuizApp - Kompleksowa Dokumentacja Systemu

## 📋 Spis Treści

1. [Przegląd Systemu](#przegląd-systemu)
2. [Instalacja i Uruchomienie](#instalacja-i-uruchomienie)

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
