---
layout: home

hero:
  name: "📚 QuizApp"
  text: "Dokumentacja Systemu"
  tagline: "Platforma edukacyjna w architekturze mikroserwisów - 4 główne sekcje dokumentacji"
  image:
    src: /logo.svg
    alt: QuizApp Logo
  actions:
    - theme: brand
      text: 🔗 API Endpointy
      link: /API_ENDPOINTS
    - theme: alt
      text: 🗄 Baza Danych
      link: /DATABASE_SCHEMA
    - theme: alt
      text: 🔒 Zabezpieczenia
      link: /SECURITY

features:
  - icon: 🔗
    title: API Endpointy
    details: Szczegółowa dokumentacja wszystkich mikroserwisów - User Service, Flashcard Service, Quiz Service, Statistics Service z przykładami żądań
    link: /API_ENDPOINTS
  - icon: 🗄
    title: Baza Danych
    details: Kompletne schematy PostgreSQL - users, flashcards, quizzes, statistics z wszystkimi tabelami, relacjami i indeksami
    link: /DATABASE_SCHEMA
  - icon: 🔒
    title: Zabezpieczenia
    details: JWT Authentication, Anti-Postman Protection, Rate Limiting, CORS, BCrypt i wszystkie mechanizmy bezpieczeństwa
    link: /SECURITY
  - icon: 🏗
    title: Architektura Mikroserwisów
    details: System składa się z 4 niezależnych serwisów Java Spring Boot z PostgreSQL i React Frontend
---
