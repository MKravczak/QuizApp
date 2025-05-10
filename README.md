Projekt mojej aplikacji to platforma do robienia testów i quizów która umożliwia użytkownikom tworzenie,
udostępnianie i rozwiązywanie quizów edukacyjnych, a także zarządzanie zestawami fiszek.
Mikroserwisy i ich funkcje:
1. User Service – Mikroserwis odpowiedzialny za zarządzanie użytkownikami. Obsługuje procesy rejestracji, logowania,
a także zarządzania grupami użytkowników. Wykorzystuje Spring Security oraz JWT do bezpiecznej autoryzacji
użytkowników
2. Flashcard Service – Ten mikroserwis zajmuje się tworzeniem i edytowaniem fiszek, które są podstawą do nauki.
Użytkownicy mogą tworzyć zestawy fiszek oraz importować je z plików CSV.
3. Quiz Service – Odpowiada za generowanie testów w różnych formatach, takich jak testy zamknięte, testy otwarte czy
testy typu "przeciągnij i upuść". Opcjonalnie będzie on umożliwia także zapisywanie wyników testów, co pozwala
użytkownikom śledzić postępy i analizować swoje osiągnięcia.
4. API Gateway – Punkt komunikacji między frontendem a mikroserwisami. Odpowiada za przekierowywanie żądań do
odpowiednich mikroserwisów i autoryzację użytkowników.
5. Frontend – Podzielony na dwie główne sekcje: React odpowiada za panel użytkownika, zarządzanie kontem,
przeglądanie fiszek, quizów i wyników i Vue które jest odpowiedzialnye za interaktywne części aplikacji, takie jak
rozwiązywanie quizów i śledzenie postępów.
6. PostgreSQL – Jedna wspólna baza danych przechowująca wszystkie dane aplikacji. Baza jest podzielona na różne
schematy dla każdego mikroserwisu:
a. users – przechowuje dane użytkowników, ich rolę i sesje
b. flashcards – przechowuje fiszki i zestawy fiszek
c. quizzes – przechowuje testy, pytania oraz wyniki
d. groups – przechowuje informacje o grupach i powiązanych materiałach edukacyjnych
7. Group Service (Opcja drugoplanowa) – Umożliwia użytkownikom tworzenie i zarządzanie grupami. Dzięki temu
użytkownicy mogą udostępniać zestawy fiszek i quizów
Aplikacja jest uruchamiana w środowisku Docker, co pozwala na łatwą izolację i zarządzanie poszczególnymi komponentami
systemu. Cały system składa się z 7 kontenerów odpalająych sie przy pomocy compose. Kontenery są połączone w jedną
sieć, co umożliwia ich wzajemną komunikację w obrębie jednego środowiska.

Architektura systemu
Projekt jest oparty na architekturze mikroserwisów, gdzie każdy serwis odpowiada za konkretny fragment funkcjonalności.
Mikroserwisy

User Service - zarządzanie użytkownikami (rejestracja, logowanie, autoryzacja JWT)
Flashcard Service - tworzenie i zarządzanie zestawami fiszek
Quiz Service - generowanie i rozwiązywanie różnych typów testów
API Gateway - punkt wejścia do aplikacji, przekierowuje żądania do odpowiednich mikroserwisów
Group Service - (opcjonalny) zarządzanie grupami użytkowników

Infrastruktura

Docker - konteneryzacja aplikacji
PostgreSQL - baza danych podzielona na schematy dla poszczególnych mikroserwisów
Frontend - React (panel użytkownika) i Vue (interaktywne komponenty)

Dokumentacja API
User Service API
Endpointy autoryzacji
MetodaEndpointOpisParametryWymagane uprawnieniaPOST/api/auth/registerRejestracja nowego użytkownikausername, email, passwordBrakPOST/api/auth/loginLogowanie użytkownikausername, passwordBrakPOST/api/auth/refresh-tokenOdświeżenie tokenu JWTrefreshTokenBrakPOST/api/auth/logoutWylogowanie użytkownikarefreshTokenUżytkownik
Endpointy użytkowników
MetodaEndpointOpisParametryWymagane uprawnieniaGET/api/users/mePobieranie danych zalogowanego użytkownika-UżytkownikPUT/api/users/meAktualizacja danych użytkownikaemail, password, firstName, lastNameUżytkownikGET/api/users/{id}Pobieranie danych użytkownika po IDid (ścieżka)AdminGET/api/usersPobieranie listy użytkownikówpage, size, sortAdminPUT/api/users/{id}/roleZmiana roli użytkownikaid (ścieżka), rolesAdminDELETE/api/users/{id}Usunięcie użytkownikaid (ścieżka)Admin
Flashcard Service API
MetodaEndpointOpisParametryWymagane uprawnieniaPOST/api/flashcard-setsTworzenie nowego zestawu fiszekname, description, isPublicUżytkownikGET/api/flashcard-setsPobieranie wszystkich zestawów użytkownikapage, size, sortUżytkownikGET/api/flashcard-sets/publicPobieranie publicznych zestawówpage, size, sortBrakGET/api/flashcard-sets/{id}Pobieranie zestawu po IDid (ścieżka)Użytkownik*PUT/api/flashcard-sets/{id}Aktualizacja zestawuid (ścieżka), name, description, isPublicWłaścicielDELETE/api/flashcard-sets/{id}Usunięcie zestawuid (ścieżka)WłaścicielPOST/api/flashcard-sets/{id}/flashcardsDodawanie fiszki do zestawuid (ścieżka), front, backWłaścicielPUT/api/flashcard-sets/{id}/flashcards/{flashcardId}Aktualizacja fiszkiid, flashcardId (ścieżka), front, backWłaścicielDELETE/api/flashcard-sets/{id}/flashcards/{flashcardId}Usunięcie fiszkiid, flashcardId (ścieżka)WłaścicielPOST/api/flashcard-sets/importImport zestawu z pliku CSVfile (multipart), name, description, isPublicUżytkownik
*Dostęp do prywatnych zestawów tylko dla właściciela lub członków grupy
Quiz Service API
MetodaEndpointOpisParametryWymagane uprawnieniaPOST/api/quizzesTworzenie nowego quizuname, description, isPublic, questionsUżytkownikGET/api/quizzesPobieranie wszystkich quizów użytkownikapage, size, sortUżytkownikGET/api/quizzes/publicPobieranie publicznych quizówpage, size, sortBrakGET/api/quizzes/{id}Pobieranie quizu po IDid (ścieżka)Użytkownik*PUT/api/quizzes/{id}Aktualizacja quizuid (ścieżka), name, description, isPublicWłaścicielDELETE/api/quizzes/{id}Usunięcie quizuid (ścieżka)WłaścicielPOST/api/quizzes/{id}/questionsDodawanie pytania do quizuid (ścieżka), question, type, answers, correctAnswersWłaścicielPUT/api/quizzes/{id}/questions/{questionId}Aktualizacja pytaniaid, questionId (ścieżka), question, answers, correctAnswersWłaścicielDELETE/api/quizzes/{id}/questions/{questionId}Usunięcie pytaniaid, questionId (ścieżka)WłaścicielPOST/api/quizzes/{id}/attemptRozpoczęcie próby rozwiązania quizuid (ścieżka)UżytkownikPOST/api/quizzes/attempts/{attemptId}/submitZakończenie próbyattemptId (ścieżka), answersUżytkownikGET/api/quizzes/attempts/{attemptId}Pobieranie wyniku próbyattemptId (ścieżka)Użytkownik
*Dostęp do prywatnych quizów tylko dla właściciela lub członków grupy
Group Service API (opcjonalne)
MetodaEndpointOpisParametryWymagane uprawnieniaPOST/api/groupsTworzenie nowej grupyname, descriptionUżytkownikGET/api/groupsPobieranie grup użytkownikapage, size, sortUżytkownikGET/api/groups/{id}Pobieranie grupy po IDid (ścieżka)Członek grupyPUT/api/groups/{id}Aktualizacja grupyid (ścieżka), name, descriptionAdministrator grupyDELETE/api/groups/{id}Usunięcie grupyid (ścieżka)Administrator grupyPOST/api/groups/{id}/membersDodawanie członka do grupyid (ścieżka), userIdAdministrator grupyDELETE/api/groups/{id}/members/{userId}Usunięcie członka z grupyid, userId (ścieżka)Administrator grupyPOST/api/groups/{id}/materialsDodawanie materiału do grupyid (ścieżka), materialType, materialIdAdministrator grupyDELETE/api/groups/{id}/materials/{materialId}Usunięcie materiału z grupyid, materialId (ścieżka)Administrator grupy
Struktura bazy danych
Schema: users
Tabela: users
id: bigint (PK)
username: varchar(255) UNIQUE
email: varchar(255) UNIQUE
password: varchar(255)
first_name: varchar(255)
last_name: varchar(255)
created_at: timestamp
updated_at: timestamp
Tabela: roles
id: bigint (PK)
name: varchar(50)
Tabela: user_roles
user_id: bigint (FK -> users.id)
role_id: bigint (FK -> roles.id)
PRIMARY KEY (user_id, role_id)
Tabela: refresh_tokens
id: bigint (PK)
user_id: bigint (FK -> users.id)
token: varchar(255)
expires_at: timestamp
created_at: timestamp
Schema: flashcards
Tabela: flashcard_sets
id: bigint (PK)
name: varchar(255)
description: text
owner_id: bigint (FK -> users.id)
is_public: boolean
created_at: timestamp
updated_at: timestamp
Tabela: flashcards
id: bigint (PK)
set_id: bigint (FK -> flashcard_sets.id)
front: text
back: text
created_at: timestamp
updated_at: timestamp
Schema: quizzes
Tabela: quizzes
id: bigint (PK)
name: varchar(255)
description: text
owner_id: bigint (FK -> users.id)
is_public: boolean
created_at: timestamp
updated_at: timestamp
Tabela: questions
id: bigint (PK)
quiz_id: bigint (FK -> quizzes.id)
question: text
type: varchar(50) // 'MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TRUE_FALSE', 'OPEN', 'DRAG_DROP'
created_at: timestamp
updated_at: timestamp
Tabela: answers
id: bigint (PK)
question_id: bigint (FK -> questions.id)
content: text
is_correct: boolean
order_index: int // dla pytań typu DRAG_DROP
Tabela: quiz_attempts
id: bigint (PK)
quiz_id: bigint (FK -> quizzes.id)
user_id: bigint (FK -> users.id)
start_time: timestamp
end_time: timestamp
score: float
max_score: float
status: varchar(50) // 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
Tabela: user_answers
id: bigint (PK)
attempt_id: bigint (FK -> quiz_attempts.id)
question_id: bigint (FK -> questions.id)
answer_id: bigint (FK -> answers.id) // dla pytań zamkniętych
text_answer: text // dla pytań otwartych
is_correct: boolean
Schema: groups
Tabela: groups
id: bigint (PK)
name: varchar(255)
description: text
created_at: timestamp
updated_at: timestamp
Tabela: group_members
group_id: bigint (FK -> groups.id)
user_id: bigint (FK -> users.id)
role: varchar(50) // 'ADMIN', 'MEMBER'
joined_at: timestamp
PRIMARY KEY (group_id, user_id)
Tabela: group_materials
id: bigint (PK)
group_id: bigint (FK -> groups.id)
material_type: varchar(50) // 'FLASHCARD_SET', 'QUIZ'
material_id: bigint // id zestawu fiszek lub quizu
added_at: timestamp
Uruchomienie projektu
Wymagania

Docker i Docker Compose
Java 17+
Maven 3.8+

Kroki uruchomienia

Sklonuj repozytorium

git clone https://github.com/twoj-username/platforma-elearning.git

Przejdź do katalogu projektu

cd platforma-elearning

Zbuduj projekty za pomocą Mavena

mvn clean package -DskipTests

Uruchom kontenery za pomocą Docker Compose

docker-compose up -d

Aplikacja będzie dostępna pod adresem:


API Gateway: http://localhost:8080
Frontend: http://localhost:3000

Implementacja logowania
Aby zaimplementować funkcję logowania użytkowników, należy wykonać następujące kroki:

Utworzenie User Service zawierającego:

Modele danych (User, Role)
Repozytoria (UserRepository, RoleRepository)
Serwisy (UserService, AuthService)
Kontrolery (AuthController, UserController)
Konfigurację Spring Security i JWT


Skonfigurowanie bazy danych PostgreSQL
Utworzenie API Gateway z odpowiednimi trasami
Testowanie funkcjonalności

Struktura projektu
platforma-elearning/
├── user-service/
│   ├── src/main/java/com/example/userservice/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   └── JwtConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   └── UserController.java
│   │   ├── exception/
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   └── RefreshToken.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   └── RefreshTokenRepository.java
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── UserDetailsServiceImpl.java
│   │   │   └── UserPrincipal.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── AuthServiceImpl.java
│   │   │   ├── UserService.java
│   │   │   └── UserServiceImpl.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── SignupRequest.java
│   │   │   │   └── TokenRefreshRequest.java
│   │   │   └── response/
│   │   │       ├── JwtResponse.java
│   │   │       ├── MessageResponse.java
│   │   │       └── TokenRefreshResponse.java
│   │   └── UserServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── api-gateway/
│   ├── src/main/java/com/example/apigateway/
│   │   ├── config/
│   │   │   └── RouteConfig.java
│   │   ├── filter/
│   │   │   └── AuthenticationFilter.java
│   │   └── ApiGatewayApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
└── docker-compose.yml
Plan realizacji projektu
Etap 1: Konfiguracja podstawowego środowiska

Utworzenie struktury projektu
Konfiguracja Docker i Docker Compose
Konfiguracja bazy danych PostgreSQL

Etap 2: Implementacja User Service

Utworzenie modeli danych
Implementacja rejestracji i logowania
Konfiguracja JWT i bezpieczeństwa

Etap 3: Implementacja API Gateway

Konfiguracja tras
Implementacja filtrów bezpieczeństwa

Etap 4: Implementacja Flashcard Service

Utworzenie modeli danych
Implementacja CRUD dla zestawów fiszek
Implementacja importu z CSV

Etap 5: Implementacja Quiz Service

Utworzenie modeli danych
Implementacja CRUD dla quizów
Implementacja logiki rozwiązywania quizów

Etap 6: Implementacja Group Service (opcjonalnie)

Utworzenie modeli danych
Implementacja zarządzania grupami

Etap 7: Implementacja frontendu

Utworzenie panelu użytkownika (React)
Implementacja komponentów interaktywnych (Vue)

Etap 8: Testowanie i dokumentacja

Testowanie funkcjonalności
Finalizacja dokumentacji
Przygotowanie do wdrożenia
