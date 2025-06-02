# 📚 QuizApp - Indeks Dokumentacji

## 🎯 Witamy w Kompleksowej Dokumentacji QuizApp

Ta dokumentacja zawiera szczegółowy opis całego systemu QuizApp - nowoczesnej platformy edukacyjnej zbudowanej w architekturze mikroserwisów.

---

## 📋 Mapa Dokumentacji

### 🏠 Dokumenty Główne

| 📄 Dokument | 📝 Opis | 🔗 Link |
|-------------|---------|---------|
| **Przegląd Systemu** | Kompletne omówienie QuizApp z wszystkimi mikroserwisami, endpointami, bazą danych i zabezpieczeniami | [README.md](./README.md) |
| **API Reference** | Szczegółowa dokumentacja wszystkich endpointów REST API | [API_ENDPOINTS.md](./API_ENDPOINTS.md) |
| **Schemat Bazy Danych** | Kompletna struktura PostgreSQL z tabelami, relacjami i indeksami | [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) |
| **Architektura Techniczna** | Wzorce projektowe, DDD, przepływy danych i deployment | [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) |

### 🔒 Dokumenty Bezpieczeństwa

| 📄 Dokument | 📝 Opis | 🔗 Link |
|-------------|---------|---------|
| **Zabezpieczenia** | Mechanizmy Anti-Postman, Rate Limiting, JWT | [SECURITY.md](./SECURITY.md) |
| **Konfiguracja Bezpieczeństwa** | Template konfiguracji zabezpieczeń | [security-config-template.properties](./security-config-template.properties) |

---

## 🚀 Quick Start Guide

### 1. **Dla Deweloperów Backend**
```
📖 Zacznij od: README.md → ARCHITECTURE_OVERVIEW.md → DATABASE_SCHEMA.md
🎯 Fokus: Mikroserwisy, wzorce projektowe, struktura bazy danych
```

### 2. **Dla Deweloperów Frontend**
```
📖 Zacznij od: README.md → API_ENDPOINTS.md → SECURITY.md
🎯 Fokus: Endpointy API, nagłówki bezpieczeństwa, JWT flow
```

### 3. **Dla Architektów Systemu**
```
📖 Zacznij od: ARCHITECTURE_OVERVIEW.md → README.md → DATABASE_SCHEMA.md
🎯 Fokus: DDD, wzorce, skalowalność, deployment
```

### 4. **Dla DevOps**
```
📖 Zacznij od: README.md → SECURITY.md → ARCHITECTURE_OVERVIEW.md
🎯 Fokus: Docker Compose, monitoring, CI/CD, Kubernetes
```

### 5. **Dla Testerów**
```
📖 Zacznij od: API_ENDPOINTS.md → SECURITY.md → README.md
🎯 Fokus: Endpointy, testowanie API, nagłówki bezpieczeństwa
```

---

## 🏗 Komponenty Systemu

### 🔧 Mikroserwisy
| Serwis | Port | Odpowiedzialność | Dokumentacja |
|--------|------|------------------|---------------|
| **User Service** | 8080 | Uwierzytelnianie, autoryzacja, grupy | [API](./API_ENDPOINTS.md#user-service-api) |
| **Flashcard Service** | 8081 | Zarządzanie fiszkami, import CSV/TXT | [API](./API_ENDPOINTS.md#flashcard-service-api) |
| **Quiz Service** | 8083 | Tworzenie quizów, pytania, wyniki | [API](./API_ENDPOINTS.md#quiz-service-api) |
| **Statistics Service** | 8084 | Analityka, statystyki, raporty | [API](./API_ENDPOINTS.md#statistics-service-api) |
| **Frontend** | 3000 | React UI, wizualizacje | [README](./README.md#frontend) |

### 🗄 Baza Danych
| Schema | Tabele | Opis | Dokumentacja |
|--------|--------|------|---------------|
| **users** | users, roles, groups, refresh_tokens | Użytkownicy i autoryzacja | [DB Schema](./DATABASE_SCHEMA.md#schema-users) |
| **flashcards** | flashcard_decks, flashcards | Fiszki edukacyjne | [DB Schema](./DATABASE_SCHEMA.md#schema-flashcards) |
| **quizzes** | quizzes, quiz_questions, quiz_results | Quizy i wyniki | [DB Schema](./DATABASE_SCHEMA.md#schema-quizzes) |
| **statistics** | quiz_statistics | Analityka i raporty | [DB Schema](./DATABASE_SCHEMA.md#schema-statistics) |

---

## 🔍 Wyszukiwanie w Dokumentacji

### 🔑 Kluczowe Tematy

#### Mikroserwisy i API
- [Wszystkie endpointy](./API_ENDPOINTS.md#przegląd-wszystkich-endpointów)
- [User Service API](./API_ENDPOINTS.md#user-service-api-port-8080)
- [Flashcard Service API](./API_ENDPOINTS.md#flashcard-service-api-port-8081)
- [Quiz Service API](./API_ENDPOINTS.md#quiz-service-api-port-8083)
- [Statistics Service API](./API_ENDPOINTS.md#statistics-service-api-port-8084)

#### Baza Danych
- [Przegląd schematów](./DATABASE_SCHEMA.md#przegląd-schematów)
- [Tabele użytkowników](./DATABASE_SCHEMA.md#schema-users)
- [Struktura quizów](./DATABASE_SCHEMA.md#schema-quizzes)
- [Views i funkcje](./DATABASE_SCHEMA.md#views-i-funkcje)
- [Performance optimization](./DATABASE_SCHEMA.md#performance-optimization)

#### Zabezpieczenia
- [JWT Authentication](./README.md#jwt-authentication)
- [Anti-Postman Protection](./SECURITY.md#wprowadzone-zabezpieczenia-anti-postman)
- [Rate Limiting](./README.md#rate-limiting)
- [Security Headers](./API_ENDPOINTS.md#security-headers)

#### Architektura i Wzorce
- [Domain-Driven Design](./ARCHITECTURE_OVERVIEW.md#domain-driven-design-ddd)
- [Wzorce projektowe](./ARCHITECTURE_OVERVIEW.md#wzorce-projektowe)
- [Data Flow](./ARCHITECTURE_OVERVIEW.md#data-flow-architecture)
- [Deployment](./ARCHITECTURE_OVERVIEW.md#deployment-architecture)

---

## 🛠 Narzędzia i Technologie

### Backend Stack
```
Java 17 + Spring Boot 3.2
Spring Security + JWT
Spring Data JPA
PostgreSQL 14
Docker + Docker Compose
```
📖 Szczegóły: [Stack Technologiczny](./README.md#stack-technologiczny)

### Frontend Stack  
```
React 18 + TypeScript
Bootstrap 5
Chart.js
Axios
```
📖 Szczegóły: [Frontend](./README.md#frontend-port-3000)

### Infrastructure
```
Docker Containers
PostgreSQL Database
Nginx (future)
Kubernetes (future)
```
📖 Szczegóły: [Deployment Architecture](./ARCHITECTURE_OVERVIEW.md#deployment-architecture)

---

## 🎯 Przypadki Użycia

### 👨‍🎓 Dla Użytkowników
- **Nauczyciele**: Tworzenie quizów i zestawów fiszek dla uczniów
- **Uczniowie**: Rozwiązywanie quizów i nauka z fiszek
- **Administratorzy**: Zarządzanie użytkownikami i grupami

### 👨‍💻 Dla Deweloperów
- **Przykład architektury mikroserwisów** w Spring Boot
- **Implementacja DDD** i wzorców projektowych
- **Zaawansowane zabezpieczenia** web aplikacji
- **RESTful API** z pełną dokumentacją

---

## 📊 Statystyki Dokumentacji

| 📄 Statystyka | 📈 Wartość |
|---------------|-----------|
| **Łączna liczba stron** | 4 główne dokumenty |
| **Endpointy API** | 50+ udokumentowanych endpointów |
| **Tabele bazy danych** | 10 głównych tabel |
| **Mikroserwisy** | 4 serwisy + frontend |
| **Wzorce projektowe** | 5+ implementowanych wzorców |
| **Mechanizmy bezpieczeństwa** | 7 warstw zabezpieczeń |

---

## 🔄 Aktualizacje Dokumentacji

Ta dokumentacja jest aktualizowana wraz z rozwojem systemu. Ostatnia aktualizacja: **Grudzień 2024**.

### 📅 Historia Zmian
- **v1.0** - Pierwsza wersja kompletnej dokumentacji
- **v1.1** - Dodanie diagramów architektury
- **v1.2** - Rozszerzenie dokumentacji API
- **v1.3** - Aktualizacja schematów bazy danych

---

## 🆘 Pomoc i Wsparcie

### 🔍 Szukasz konkretnej informacji?

| 🎯 Potrzebujesz | 📖 Sprawdź |
|----------------|------------|
| **Jak uruchomić projekt?** | [Instalacja i Uruchomienie](./README.md#instalacja-i-uruchomienie) |
| **Jak testować API?** | [Przykłady testowania API](./API_ENDPOINTS.md#przykłady-testowania-api) |
| **Jak działa bezpieczeństwo?** | [Zabezpieczenia](./README.md#zabezpieczenia) |
| **Struktura bazy danych?** | [Database Schema](./DATABASE_SCHEMA.md) |
| **Wzorce architektoniczne?** | [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) |

### 📞 Kontakt
W przypadku pytań dotyczących dokumentacji lub systemu, sprawdź najpierw odpowiednie sekcje powyżej.

---

**🎓 QuizApp** - Nowoczesna platforma edukacyjna zbudowana z myślą o skalowalności, bezpieczeństwie i najlepszych praktykach rozwoju oprogramowania. 