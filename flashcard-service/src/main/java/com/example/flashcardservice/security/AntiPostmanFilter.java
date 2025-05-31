package com.example.flashcardservice.security;

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
@Order(1)
public class AntiPostmanFilter implements Filter {

    @Value("${app.security.anti-postman.enabled:true}")
    private boolean antiPostmanEnabled;

    @Value("${app.security.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Value("${app.security.client-secret:MIkolajKrawczakClientSecret2024AntiPostmanProtectionAdvancedSecurity}")
    private String clientSecret;

    
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

        if (!antiPostmanEnabled) {
            chain.doFilter(request, response);
            return;
        }

        String requestPath = httpRequest.getRequestURI();
        if (requestPath.contains("/actuator/") || requestPath.contains("/health")) {
            chain.doFilter(request, response);
            return;
        }

        String userAgent = httpRequest.getHeader("User-Agent");
        if (userAgent == null || isBlockedUserAgent(userAgent)) {
            log.warn("Blocked request with suspicious User-Agent: {}", userAgent);
            sendBlockedResponse(httpResponse, "Invalid client");
            return;
        }

        String origin = httpRequest.getHeader("Origin");
        String referer = httpRequest.getHeader("Referer");
        
        if (!isValidOrigin(origin, referer)) {
            log.warn("Blocked request with invalid Origin/Referer. Origin: {}, Referer: {}", origin, referer);
            sendBlockedResponse(httpResponse, "Invalid origin");
            return;
        }

        if (!hasBrowserHeaders(httpRequest)) {
            log.warn("Blocked request missing browser headers");
            sendBlockedResponse(httpResponse, "Missing required headers");
            return;
        }

        String antiCsrfToken = httpRequest.getHeader("X-Requested-With");
        if (!"XMLHttpRequest".equals(antiCsrfToken)) {
            log.warn("Blocked request missing X-Requested-With header");
            sendBlockedResponse(httpResponse, "Missing security token");
            return;
        }

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
        
        if (origin != null) {
            return allowed.stream().anyMatch(allowedOrigin -> 
                origin.trim().equals(allowedOrigin.trim()));
        }
        
        if (referer != null) {
            return allowed.stream().anyMatch(allowedOrigin -> 
                referer.startsWith(allowedOrigin.trim()));
        }

        return false;
    }

    private boolean hasBrowserHeaders(HttpServletRequest request) {
        return requiredBrowserHeaders.stream()
                .allMatch(header -> request.getHeader(header) != null);
    }

    private boolean isValidClientSignature(String signature, HttpServletRequest request) {
        if (signature == null) {
            log.warn("No client signature provided");
            return false;
        }
        
        try {
            String expectedSignature = generateClientSignature(request);
            log.info("Client signature validation - Received: {}, Expected: {}, Path: {}, Timestamp: {}", 
                signature, expectedSignature, request.getRequestURI(), request.getHeader("X-Timestamp"));
            return signature.equals(expectedSignature);
        } catch (Exception e) {
            log.error("Error validating client signature", e);
            return false;
        }
    }

    private String generateClientSignature(HttpServletRequest request) {
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