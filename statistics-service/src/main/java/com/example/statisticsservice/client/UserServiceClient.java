package com.example.statisticsservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Component
public class UserServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceClient.class);
    
    private final RestTemplate restTemplate;
    private final String userServiceUrl;

    public UserServiceClient(@Value("${user-service.url:http://localhost:8080}") String userServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.userServiceUrl = userServiceUrl;
    }

    /**
     * Pobiera ID grup, do których należy użytkownik
     */
    public Set<Long> getUserGroupIds(Long userId) {
        try {
            String url = userServiceUrl + "/api/groups/my";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-ID", userId.toString());
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            logger.debug("Pobieranie grup użytkownika: userId={}", userId);
            
            ResponseEntity<GroupDto[]> response = restTemplate.exchange(url, HttpMethod.GET, request, GroupDto[].class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Set<Long> groupIds = new HashSet<>();
                for (GroupDto group : response.getBody()) {
                    groupIds.add(group.getId());
                }
                logger.debug("Znaleziono grupy użytkownika: userId={}, groupIds={}", userId, groupIds);
                return groupIds;
            }
            
            return new HashSet<>();
            
        } catch (HttpClientErrorException e) {
            logger.debug("Błąd podczas pobierania grup użytkownika: userId={}, status={}", userId, e.getStatusCode());
            return new HashSet<>();
        } catch (Exception e) {
            logger.error("Nieoczekiwany błąd podczas pobierania grup użytkownika: userId={}", userId, e);
            return new HashSet<>();
        }
    }

    /**
     * Sprawdza czy użytkownik ma rolę administratora
     */
    public boolean isUserAdmin(Long userId) {
        try {
            String url = userServiceUrl + "/api/users/" + userId + "/is-admin";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-ID", userId.toString());
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            logger.debug("Sprawdzanie roli administratora: userId={}", userId);
            
            ResponseEntity<AdminCheckResponse> response = restTemplate.exchange(url, HttpMethod.GET, request, AdminCheckResponse.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                boolean isAdmin = response.getBody().isAdmin();
                logger.debug("Wynik sprawdzenia roli administratora: userId={}, isAdmin={}", userId, isAdmin);
                return isAdmin;
            }
            
            return false;
            
        } catch (HttpClientErrorException e) {
            logger.debug("Błąd podczas sprawdzania roli administratora: userId={}, status={}", userId, e.getStatusCode());
            return false;
        } catch (Exception e) {
            logger.error("Nieoczekiwany błąd podczas sprawdzania roli administratora: userId={}", userId, e);
            return false;
        }
    }

    // DTO dla odpowiedzi z user-service
    public static class GroupDto {
        private Long id;
        private String name;
        private String description;
        private Long adminId;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Long getAdminId() { return adminId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
    }
    
    public static class AdminCheckResponse {
        private boolean isAdmin;
        
        public AdminCheckResponse() {}
        
        public AdminCheckResponse(boolean isAdmin) {
            this.isAdmin = isAdmin;
        }
        
        public boolean isAdmin() { return isAdmin; }
        public void setAdmin(boolean admin) { isAdmin = admin; }
    }
} 