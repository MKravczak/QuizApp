term::definition
Jaka jest główna architektura aplikacji?::Aplikacja oparta jest na mikroserwisach, z osobnymi serwisami dla użytkowników, fiszek, quizów i statystyk, oraz oddzielnym frontendem.
Jak konteneryzowana jest aplikacja?::Cała aplikacja (backend, frontend, baza danych) jest konteneryzowana przy użyciu Docker i zarządzana przez Docker Compose.
Jakie są główne komponenty systemu?::PostgreSQL (baza danych), user-service, flashcard-service, quiz-service, statistics-service (backend), frontend (React).
W jaki sposób zapewniona jest skalowalność?::Architektura mikroserwisowa pozwala na niezależne skalowanie poszczególnych komponentów.
Jakie są potencjalne punkty awarii (SPOF)?::Pojedyncza instancja bazy danych PostgreSQL może być SPOF, jeśli nie jest skonfigurowana replikacja lub klaster.
Jaki system bazy danych jest używany?::PostgreSQL w wersji 14 (obraz `postgres:14-alpine`).
Jak nazywa się główna baza danych?::`quizapp`
Jak zarządzane są migracje schematu BD?::Flyway w `quiz-service` (ustawienie `SPRING_JPA_HIBERNATE_DDL_AUTO: validate`) oraz prawdopodobnie `SPRING_JPA_HIBERNATE_DDL_AUTO: update` w pozostałych serwisach dla prostszych zmian.
Gdzie przechowywane są dane PostgreSQL?::W wolumenie Docker o nazwie `postgres-data`.
Jaki jest domyślny użytkownik i hasło do bazy danych?::Użytkownik: `postgres`, Hasło: `postgres` (zdefiniowane w `docker-compose.yml`).
Czy baza danych jest inicjalizowana jakimiś danymi startowymi?::Tak, za pomocą skryptu `./init-schema.sql` montowanego do `/docker-entrypoint-initdb.d/`.
Czy pg_stat_statements jest włączone?::Tak, `-c shared_preload_libraries=pg_stat_statements -c pg_stat_statements.track=all` w komendzie uruchomienia PostgreSQL.
Na jakim frameworku oparte są serwisy?::Spring Boot w wersji 3.2.0.
Jaki język programowania jest używany?::Java w wersji 17.
Jak realizowana jest komunikacja z BD?::Za pomocą Spring Data JPA.
Jak realizowane są API RESTowe?::Za pomocą Spring Web (część Spring Boot).
Jakie narzędzie służy do redukcji kodu (gettery, settery itp.)?::Lombok.
Jak zarządzane są zależności w backendzie?::Za pomocą Maven.
Jaka jest domyślna wersja Spring Boot?::3.2.0.
Czy serwisy backendowe używają Spring Security?::Tak, `spring-boot-starter-security` jest w zależnościach `pom.xml`.
Czy jest używana walidacja Bean Validation?::Tak, `spring-boot-starter-validation` jest w zależnościach.
Na jakim frameworku/bibliotece oparty jest frontend?::React w wersji 18.2.0.
Jak realizowane są żądania HTTP do backendu?::Za pomocą biblioteki Axios.
Jakie biblioteki UI są używane?::Bootstrap i React-Bootstrap.
Jak realizowana jest nawigacja (routing) w aplikacji frontendowej?::Za pomocą React Router DOM.
Jak zarządzane są zależności i skrypty w projekcie frontendowym?::Za pomocą NPM i pliku `package.json` (skrypty `start`, `build`, `test`).
Jak serwowany jest frontend w środowisku deweloperskim?::Poprzez `react-scripts start` (serwer deweloperski Webpack), wystawiony na porcie 3000.
Czy frontend jest przygotowany do budowy produkcyjnej?::Tak, skrypt `npm run build` tworzy statyczne pliki, które mogą być serwowane przez Nginx.
Jakie narzędzia do tworzenia wykresów są używane?::Chart.js i react-chartjs-2.
Jaka jest konfiguracja ESLint?::Rozszerza `react-app` i `react-app/jest`.
Na jakim porcie nasłuchuje `user-service`?::8080.
Jaka jest prawdopodobna główna odpowiedzialność `user-service`?::Zarządzanie użytkownikami: rejestracja, logowanie, uwierzytelnianie, autoryzacja, zarządzanie profilami.
Jak `user-service` konfiguruje połączenie z bazą danych?::Poprzez zmienne środowiskowe: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
Jak `user-service` zarządza schematem bazy danych?::`SPRING_JPA_HIBERNATE_DDL_AUTO: update`.
Na jakim porcie nasłuchuje `flashcard-service`?::8081.
Jaka jest prawdopodobna główna odpowiedzialność `flashcard-service`?::Zarządzanie fiszkami: tworzenie, edycja, usuwanie, przeglądanie, kategoryzacja.
Czy `flashcard-service` obsługuje przesyłanie plików?::Tak, używa wolumenu `flashcard-uploads` zamapowanego na `/app/uploads`, co sugeruje przechowywanie np. obrazków do fiszek.
Jak `flashcard-service` zarządza schematem bazy danych?::`SPRING_JPA_HIBERNATE_DDL_AUTO: update`.
Na jakim porcie nasłuchuje `quiz-service`?::8083.
Jaka jest prawdopodobna główna odpowiedzialność `quiz-service`?::Zarządzanie quizami: tworzenie quizów z pytań (być może z fiszek), przeprowadzanie quizów, ocenianie odpowiedzi.
Jak `quiz-service` zarządza schematem bazy danych?::`SPRING_JPA_HIBERNATE_DDL_AUTO: validate`, co oznacza, że schemat powinien być zarządzany przez Flyway (obecny w `pom.xml`).
Na jakim porcie nasłuchuje `statistics-service`?::8084.
Jaka jest prawdopodobna główna odpowiedzialność `statistics-service`?::Gromadzenie, przetwarzanie i udostępnianie statystyk dotyczących aktywności użytkowników, wyników quizów, popularności fiszek itp.
Jak `statistics-service` zarządza schematem bazy danych?::`SPRING_JPA_HIBERNATE_DDL_AUTO: update`.
Jaki obraz PostgreSQL jest używany?::`postgres:14-alpine`.
Jak nazywa się sieć Docker używana przez aplikację?::`quizapp-network` (typu `bridge`).
Jakie wolumeny są zdefiniowane?::`postgres-data` (dla danych PostgreSQL) i `flashcard-uploads` (dla plików przesyłanych do `flashcard-service`).
Od jakich serwisów zależy `user-service`?::Od `postgres` (musi być `service_healthy`).
Jakie zmienne środowiskowe są przekazywane do kontenera `frontend`?::M.in. `REACT_APP_USER_SERVICE_URL`, `REACT_APP_FLASHCARD_SERVICE_URL`, `REACT_APP_QUIZ_SERVICE_URL`, `REACT_APP_STATISTICS_SERVICE_URL`.
Do czego służy `CHOKIDAR_USEPOLLING=true` w kontenerze `frontend`?::Jest to ustawienie często używane w środowiskach Docker do poprawnego działania hot-reloadingu plików w systemach plików, które nie wysyłają natywnie zdarzeń o zmianach.
Jaki Dockerfile jest używany do budowy `frontend` w `docker-compose.yml`?::`Dockerfile.dev`.
Czy serwisy backendowe mają zdefiniowane healthchecki w `docker-compose.yml`?::Nie, tylko serwis `postgres` ma zdefiniowany healthcheck.
Jak frontend identyfikuje adresy serwisów backendowych?::Poprzez zmienne środowiskowe wstrzykiwane podczas budowy/uruchomienia kontenera frontendowego (np. `REACT_APP_USER_SERVICE_URL`).
Jaki jest format URLi serwisów backendowych używanych przez frontend?::np. `http://user-service:8080` (używa nazw serwisów Dockerowych jako hostów).
Czy jest widoczny jakiś API Gateway lub Service Discovery?::Nie bezpośrednio w `docker-compose.yml`. Komunikacja wydaje się być bezpośrednia między frontendem a backendami oraz potencjalnie między backendami.
Jaki mechanizm bezpieczeństwa jest zaimplementowany w backendzie?::Spring Security. Szczegóły (np. JWT, OAuth2) wymagałyby analizy kodu implementacji.
Czy frontend implementuje jakieś mechanizmy bezpieczeństwa po stronie klienta?::Prawdopodobnie obsługuje tokeny (np. JWT) i zarządza sesją użytkownika, ale szczegóły wymagałyby analizy kodu.
Jakie są potencjalne wektory ataku na aplikację?::Standardowe dla aplikacji webowych: XSS, CSRF, SQL Injection (choć JPA pomaga), problemy z autoryzacją/uwierzytelnianiem, niezabezpieczone API.
Jakie zależności testowe są w `quiz-service/pom.xml`?::`spring-boot-starter-test` i `spring-security-test`.
Jakie skrypty testowe są dostępne w projekcie frontendowym?::`npm test` (uruchamia `react-scripts test`).
Czy są widoczne testy E2E lub integracyjne na poziomie `docker-compose`?::Nie widać konfiguracji dla nich w `docker-compose.yml`.
Do czego służy plik `fiszki-java.csv`?::Prawdopodobnie zawiera początkowe dane dla fiszek (terminy i definicje związane z Javą), które mogą być importowane do `flashcard-service`.
Do czego służy plik `init-schema.sql`?::Do inicjalizacji schematu bazy danych PostgreSQL przy pierwszym uruchomieniu kontenera bazy (np. tworzenie tabel, jeśli nie używa się w pełni automatycznych migracji JPA/Flyway dla wszystkich tabel).
Jaka jest zawartość `frontend/nginx.conf`?::Konfiguracja serwera Nginx, prawdopodobnie do serwowania zbudowanej aplikacji React w środowisku produkcyjnym i/lub jako reverse proxy.
Co znajduje się w `.vscode/`?::Ustawienia specyficzne dla edytora Visual Studio Code (np. rekomendowane rozszerzenia, ustawienia debugowania).
Jaki jest cel katalogu `target/` w serwisach Mavenowych?::Przechowuje skompilowane klasy, spakowane artefakty (np. pliki JAR) i inne wyniki procesu budowy Mavena.
Jaki jest cel katalogu `build/` w projekcie frontendowym?::Przechowuje zbudowaną, statyczną wersję aplikacji frontendowej, gotową do wdrożenia.
Co definiuje `Dockerfile` w każdym serwisie backendowym?::Instrukcje budowy obrazu Docker dla danego serwisu (np. kopiowanie JARa, ustawianie punktu wejścia).
Czy `user-service` obsługuje role użytkowników?::Prawdopodobnie tak, jeśli używa Spring Security w pełni (np. ADMIN, USER).
Czy jest możliwość resetowania hasła?::Typowa funkcjonalność, ale wymagałaby sprawdzenia w kodzie.
Czy fiszki mogą mieć różne typy (np. tekst, obraz, audio)?::Wolumen `flashcard-uploads` sugeruje obsługę przynajmniej obrazów.
Czy fiszki można organizować w zestawy/kategorie?::Logiczna funkcjonalność dla aplikacji z fiszkami.
Czy jest system powtórek interwałowych (SRS)?::Zaawansowana funkcjonalność dla fiszek, wymagałaby dedykowanej logiki.
Z jakich elementów składają się quizy?::Prawdopodobnie z pytań, które mogą być generowane na podstawie fiszek lub dodawane manualnie.
Czy są różne typy pytań w quizach (jednokrotnego wyboru, wielokrotnego, otwarte)?::Wymagałoby sprawdzenia w kodzie/API.
Czy wyniki quizów są zapisywane i powiązane z użytkownikiem?::Niezbędne dla serwisu statystyk.
Jakie statystyki mogą być śledzone?::Postęp nauki, wyniki quizów, najtrudniejsze fiszki/pytania, aktywność użytkowników.
Czy statystyki są prezentowane w formie wykresów?::Frontend ma biblioteki do wykresów (`chart.js`).
Czy interfejs jest responsywny (RWD)?::Użycie Bootstrapa silnie na to wskazuje.
Czy aplikacja obsługuje internacjonalizację (i18n)?::Nie widać bezpośrednich oznak, ale jest to częsty wymóg.
Czy w kodzie backendowym stosowane są wzorce projektowe?::Prawdopodobnie tak, typowe dla aplikacji Springowych (np. Repository, Service, Controller).
Czy kod jest zgodny z zasadami SOLID?::Cel każdego doświadczonego programisty; wymagałoby przeglądu kodu.
Jak wygląda obsługa błędów w API?::Spring Boot oferuje mechanizmy `@ControllerAdvice` do globalnej obsługi wyjątków.
Czy używane jest logowanie w serwisach backendowych?::Standard w aplikacjach produkcyjnych (np. SLF4J z Logback/Log4j2).
Czy konfiguracja jest externalizowana?::Tak, poprzez zmienne środowiskowe w Docker Compose, co jest dobrą praktyką.
Czy są zdefiniowane reguły formatowania kodu (np. Checkstyle, Prettier)?::Nie widać plików konfiguracyjnych na najwyższym poziomie, ale mogą być wewnątrz projektów lub zintegrowane z IDE.
Czy w `README.md` znajduje się dokumentacja API?::Należałoby sprawdzić zawartość `README.md`.
Czy istnieje konfiguracja dla CI/CD (np. GitHub Actions, Jenkinsfile)?::Nie widać plików konfiguracyjnych dla CI/CD w listingu plików.
Jak wyglądałby proces wdrożenia produkcyjnego?::Budowa obrazów Docker (produkcyjnych, nie `.dev`), push do rejestru kontenerów, wdrożenie na platformę (np. Kubernetes, Docker Swarm, managed service).
Czy używany jest Nginx jako reverse proxy przed serwisami backendowymi w produkcji?::Prawdopodobne i zalecane dla obsługi SSL, load balancingu itp. `nginx.conf` w `frontend` może być częścią tego.
Jakie mechanizmy cache'owania mogą być zaimplementowane?::Spring Cache w backendzie, cache HTTP po stronie klienta/Nginx.
Czy zapytania do bazy danych są optymalizowane?::Ważne dla wydajności; `pg_stat_statements` może pomóc w identyfikacji wolnych zapytań.
Czy frontend korzysta z lazy loadingu komponentów/modułów?::Dobra praktyka w React dla większych aplikacji.
Czy aplikacja integruje się z jakimiś zewnętrznymi API (poza własnymi serwisami)?::Nie widać tego na podstawie konfiguracji, ale możliwe (np. system płatności, logowanie przez media społecznościowe).
Jaka jest rola `spring-boot-starter-parent`?::Dostarcza domyślne konfiguracje i zarządzanie zależnościami dla projektów Spring Boot.
Do czego służy adnotacja `@SpringBootApplication`?::Jest to adnotacja wygodna, która łączy `@Configuration`, `@EnableAutoConfiguration` i `@ComponentScan`.
Czym jest Spring Data JPA Repository?::Interfejsem, który dostarcza metody CRUD i możliwość definiowania własnych zapytań do bazy danych bez pisania implementacji.
Jak działa wstrzykiwanie zależności w Springu?::Poprzez adnotacje takie jak `@Autowired`, `@Component`, `@Service`, `@Repository`.
Do czego służy `Flyway`?::Do wersjonowania i zarządzania migracjami schematu bazy danych.
Czym są komponenty w React?::Podstawowymi blokami budulcowymi interfejsu użytkownika, mogą być funkcyjne lub klasowe.
Czym jest JSX?::Rozszerzeniem składni JavaScript, które pozwala pisać kod podobny do HTML w plikach React.
Do czego służą hooki w React (np. `useState`, `useEffect`)?::Pozwalają na używanie stanu i innych funkcji Reacta w komponentach funkcyjnych.
Jak działa wirtualny DOM (Virtual DOM) w React?::React tworzy w pamięci reprezentację rzeczywistego DOM, oblicza minimalne zmiany i efektywnie aktualizuje przeglądarkę.
Do czego służy `react-router-dom`?::Do implementacji routingu po stronie klienta w aplikacjach React, umożliwiając nawigację między różnymi widokami bez przeładowywania strony.