import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: '📚 QuizApp - Dokumentacja',
  description: 'Kompleksowa dokumentacja systemu QuizApp - platforma edukacyjna w architekturze mikroserwisów',
  lang: 'pl',
  base: '/',
  
  themeConfig: {
    logo: '📚',
    siteTitle: 'QuizApp Docs',
    
    nav: [
      { text: '🏠 Strona Główna', link: '/' },
      { text: '📋 Prezentacja', link: '/PRESENTATION' },
      { text: '🏗️ Mikroserwisy', link: '/SERVICES' },
      { text: '🔗 API Endpointy', link: '/API_ENDPOINTS' },
      { text: '🗄 Baza Danych', link: '/DATABASE_SCHEMA' },
      { text: '🔒 Zabezpieczenia', link: '/SECURITY' },
      { text: '🔑 JWT Tokeny', link: '/JWT_LIFECYCLE' }
    ],
    
    sidebar: [
      {
        text: '📖 Główne Sekcje',
        items: [
          { text: '🏠 Strona Główna', link: '/' },
          { text: '📋 Prezentacja', link: '/PRESENTATION' },
          { text: '🏗️ Mikroserwisy', link: '/SERVICES' },
          { text: '🔗 API Endpointy', link: '/API_ENDPOINTS' },
          { text: '🗄 Baza Danych', link: '/DATABASE_SCHEMA' },
          { text: '🔒 Zabezpieczenia', link: '/SECURITY' },
          { text: '🔑 JWT Tokeny', link: '/JWT_LIFECYCLE' }
        ]
      },
      {
        text: '🏗️ Architektura Mikroserwisów',
        items: [
          { text: '🔐 User Service', link: '/SERVICES#user-service-port-8080' },
          { text: '📚 Flashcard Service', link: '/SERVICES#flashcard-service-port-8081' },
          { text: '🧠 Quiz Service', link: '/SERVICES#quiz-service-port-8083' },
          { text: '📊 Statistics Service', link: '/SERVICES#statistics-service-port-8084' },
          { text: '🎨 Frontend Service', link: '/SERVICES#frontend-service-port-3000' }
        ]
      },
      {
        text: '🔗 API - Mikroserwisy',
        items: [
          { text: '👤 User Service', link: '/API_ENDPOINTS#user-service-api-port-8080' },
          { text: '📚 Flashcard Service', link: '/API_ENDPOINTS#flashcard-service-api-port-8081' },
          { text: '🧠 Quiz Service', link: '/API_ENDPOINTS#quiz-service-api-port-8083' },
          { text: '📊 Statistics Service', link: '/API_ENDPOINTS#statistics-service-api-port-8084' }
        ]
      },
      {
        text: '🗄 Baza Danych - Schematy',
        items: [
          { text: '👤 Schema: users', link: '/DATABASE_SCHEMA#schema-users' },
          { text: '📚 Schema: flashcards', link: '/DATABASE_SCHEMA#schema-flashcards' },
          { text: '🧠 Schema: quizzes', link: '/DATABASE_SCHEMA#schema-quizzes' },
          { text: '📊 Schema: statistics', link: '/DATABASE_SCHEMA#schema-statistics' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo/QuizApp' }
    ],
    
    footer: {
      message: 'Dokumentacja QuizApp - System edukacyjny w architekturze mikroserwisów',
      copyright: 'Copyright © 2025 QuizApp'
    }
  }
})
