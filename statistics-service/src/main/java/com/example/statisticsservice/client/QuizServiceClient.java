package com.example.statisticsservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Set;

@Component
public class QuizServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(QuizServiceClient.class);
    
    private final RestTemplate restTemplate;
    private final String quizServiceUrl;

    public QuizServiceClient(@Value("${quiz-service.url}") String quizServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.quizServiceUrl = quizServiceUrl;
    }

    /**
     * Sprawdza czy użytkownik ma dostęp do quizu (jest właścicielem, quiz jest publiczny lub użytkownik należy do grupy z quizem)
     */
    public boolean hasAccessToQuiz(Long quizId, Long userId, Set<Long> userGroupIds) {
        try {
            String url = quizServiceUrl + "/internal/api/quizzes/" + quizId + "/check-access";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-User-ID", userId.toString());
            headers.set("X-Internal-Service", "statistics-service");
            
            HttpEntity<Set<Long>> request = new HttpEntity<>(userGroupIds, headers);
            
            logger.debug("Sprawdzanie dostępu do quizu: quizId={}, userId={}, groupIds={}", quizId, userId, userGroupIds);
            
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.POST, request, Object.class);
            
            boolean hasAccess = response.getStatusCode() == HttpStatus.OK;
            logger.debug("Wynik sprawdzenia dostępu: hasAccess={}", hasAccess);
            
            return hasAccess;
            
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.FORBIDDEN || e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                logger.debug("Brak dostępu do quizu: quizId={}, userId={}, status={}", quizId, userId, e.getStatusCode());
                return false;
            }
            logger.error("Błąd podczas sprawdzania dostępu do quizu: quizId={}, userId={}", quizId, userId, e);
            return false;
        } catch (Exception e) {
            logger.error("Nieoczekiwany błąd podczas sprawdzania dostępu do quizu: quizId={}, userId={}", quizId, userId, e);
            return false;
        }
    }

    /**
     * Sprawdza czy użytkownik jest właścicielem quizu
     */
    public boolean isQuizOwner(Long quizId, Long userId) {
        try {
            String url = quizServiceUrl + "/internal/api/quizzes/" + quizId + "/owner/" + userId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Service", "statistics-service");
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            logger.debug("Sprawdzanie właściciela quizu: quizId={}, userId={}", quizId, userId);
            
            ResponseEntity<Boolean> response = restTemplate.exchange(url, HttpMethod.GET, request, Boolean.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                boolean isOwner = response.getBody();
                logger.debug("Wynik sprawdzenia właściciela: isOwner={}", isOwner);
                return isOwner;
            }
            
            return false;
            
        } catch (HttpClientErrorException e) {
            logger.debug("Błąd podczas sprawdzania właściciela quizu: quizId={}, userId={}, status={}", quizId, userId, e.getStatusCode());
            return false;
        } catch (Exception e) {
            logger.error("Nieoczekiwany błąd podczas sprawdzania właściciela quizu: quizId={}, userId={}", quizId, userId, e);
            return false;
        }
    }

    // DTO dla odpowiedzi z quiz-service
    public static class QuizDto {
        private Long id;
        private String name;
        private String description;
        private Long userId;
        private boolean isPublic;
        private Set<Long> groupIds;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public boolean isPublic() { return isPublic; }
        public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
        
        public Set<Long> getGroupIds() { return groupIds; }
        public void setGroupIds(Set<Long> groupIds) { this.groupIds = groupIds; }
    }
} 