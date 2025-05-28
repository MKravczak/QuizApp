package com.example.userservice.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
@Order(2)
public class AntiPostmanFilter implements Filter {

    @Value("${app.security.anti-postman.enabled:true}")
    private boolean antiPostmanEnabled;

    @Value("${app.security.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Value("${app.security.client-secret:MIkolajKrawczakClientSecret2024AntiPostmanProtectionAdvancedSecurity}")
    private String clientSecret;

    // Lista podejrzanych User-Agent strings
    private final List<String> blockedUserAgents = Arrays.asList(
            "postman",
            "insomnia",
            "curl",
            "httpie",
            "wget",
            "apache-httpclient",
            "okhttp",
            "java/",
            "python-requests",
            "python-urllib",
            "go-http-client",
            "nodejs"
    );

    // Lista wymaganych nagłówków dla prawdziwej przeglądarki
    private final List<String> requiredBrowserHeaders = Arrays.asList(
            "accept",
            "accept-language",
            "accept-encoding"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Sprawdź czy filtr jest włączony
        if (!antiPostmanEnabled) {
            chain.doFilter(request, response);
            return;
        }

        // Zezwól na endpointy uwierzytelnienia (dla logowania z frontendu)
        String requestPath = httpRequest.getRequestURI();
        if (requestPath.contains("/api/auth/") || requestPath.contains("/api/test/")) {
            chain.doFilter(request, response);
            return;
        }

        // Sprawdzenie User-Agent
        String userAgent = httpRequest.getHeader("User-Agent");
        if (userAgent == null || isBlockedUserAgent(userAgent)) {
            log.warn("Blocked request with suspicious User-Agent: {}", userAgent);
            sendBlockedResponse(httpResponse, "Invalid client");
            return;
        }

        // Sprawdzenie Origin/Referer
        String origin = httpRequest.getHeader("Origin");
        String referer = httpRequest.getHeader("Referer");
        
        if (!isValidOrigin(origin, referer)) {
            log.warn("Blocked request with invalid Origin/Referer. Origin: {}, Referer: {}", origin, referer);
            sendBlockedResponse(httpResponse, "Invalid origin");
            return;
        }

        // Sprawdzenie wymaganych nagłówków przeglądarki
        if (!hasBrowserHeaders(httpRequest)) {
            log.warn("Blocked request missing browser headers");
            sendBlockedResponse(httpResponse, "Missing required headers");
            return;
        }

        // Sprawdzenie niestandardowego tokenu anty-CSRF
        String antiCsrfToken = httpRequest.getHeader("X-Requested-With");
        if (!"XMLHttpRequest".equals(antiCsrfToken)) {
            log.warn("Blocked request missing X-Requested-With header");
            sendBlockedResponse(httpResponse, "Missing security token");
            return;
        }

        // Sprawdzenie niestandardowego nagłówka bezpieczeństwa
        String securityHeader = httpRequest.getHeader("X-Client-Signature");
        if (!isValidClientSignature(securityHeader, httpRequest)) {
            log.warn("Blocked request with invalid client signature");
            sendBlockedResponse(httpResponse, "Invalid client signature");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isBlockedUserAgent(String userAgent) {
        String lowerCaseUserAgent = userAgent.toLowerCase();
        return blockedUserAgents.stream()
                .anyMatch(blocked -> lowerCaseUserAgent.contains(blocked.toLowerCase()));
    }

    private boolean isValidOrigin(String origin, String referer) {
        List<String> allowed = Arrays.asList(allowedOrigins.split(","));
        
        // Sprawdź Origin
        if (origin != null) {
            return allowed.stream().anyMatch(allowedOrigin -> 
                origin.trim().equals(allowedOrigin.trim()));
        }
        
        // Jeśli brak Origin, sprawdź Referer
        if (referer != null) {
            return allowed.stream().anyMatch(allowedOrigin -> 
                referer.startsWith(allowedOrigin.trim()));
        }
        
        // Brak obu nagłówków - podejrzane
        return false;
    }

    private boolean hasBrowserHeaders(HttpServletRequest request) {
        return requiredBrowserHeaders.stream()
                .allMatch(header -> request.getHeader(header) != null);
    }

    private boolean isValidClientSignature(String signature, HttpServletRequest request) {
        if (signature == null) {
            return false;
        }
        
        // Prosta walidacja podpisu opartego na timestamp i sekretnym kluczu
        // W prawdziwej implementacji używaj mocniejszej kryptografii
        try {
            String expectedSignature = generateClientSignature(request);
            return signature.equals(expectedSignature);
        } catch (Exception e) {
            log.error("Error validating client signature", e);
            return false;
        }
    }

    private String generateClientSignature(HttpServletRequest request) {
        // Użyj klucza z konfiguracji
        String timestamp = request.getHeader("X-Timestamp");
        String path = request.getRequestURI();
        
        if (timestamp == null) {
            return null;
        }
        
        return Integer.toHexString((timestamp + path + clientSecret).hashCode());
    }

    private void sendBlockedResponse(HttpServletResponse response, String reason) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Access denied\",\"reason\":\"" + reason + "\"}");
    }
} 