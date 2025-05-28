package com.example.userservice.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Component
@Slf4j
@Order(1)
public class RateLimitingFilter implements Filter {

    @Value("${app.security.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${app.security.rate-limit.max-requests:100}")
    private int maxRequestsPerMinute;

    @Value("${app.security.rate-limit.window-size:60000}")
    private long windowSizeMs; // 1 minuta

    // Mapa przechowująca informacje o żądaniach dla każdego IP
    private final ConcurrentHashMap<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();

    // Klasa pomocnicza do liczenia żądań
    private static class RequestCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());

        public boolean isAllowed(int maxRequests, long windowSize) {
            long now = System.currentTimeMillis();
            long windowStartTime = windowStart.get();

            // Jeśli okno czasu minęło, zresetuj licznik
            if (now - windowStartTime > windowSize) {
                if (windowStart.compareAndSet(windowStartTime, now)) {
                    count.set(1);
                    return true;
                }
            }

            // Sprawdź czy nie przekroczono limitu
            int currentCount = count.incrementAndGet();
            return currentCount <= maxRequests;
        }

        public int getCurrentCount() {
            return count.get();
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        if (!rateLimitEnabled) {
            chain.doFilter(request, response);
            return;
        }

        // Pobierz IP klienta
        String clientIp = getClientIpAddress(httpRequest);
        
        // Sprawdź endpointy wyłączone z rate limiting
        String requestPath = httpRequest.getRequestURI();
        if (isExcludedPath(requestPath)) {
            chain.doFilter(request, response);
            return;
        }

        // Sprawdź rate limit
        RequestCounter counter = requestCounters.computeIfAbsent(clientIp, k -> new RequestCounter());
        
        if (!counter.isAllowed(maxRequestsPerMinute, windowSizeMs)) {
            log.warn("Rate limit exceeded for IP: {}. Current count: {}", clientIp, counter.getCurrentCount());
            sendRateLimitResponse(httpResponse, clientIp);
            return;
        }

        // Okresowo czyść stare wpisy
        if (Math.random() < 0.01) { // 1% szans na czyszczenie
            cleanupOldEntries();
        }

        chain.doFilter(request, response);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        // Sprawdź różne nagłówki proxy
        String[] headerNames = {
                "X-Forwarded-For",
                "X-Real-IP",
                "X-Originating-IP",
                "CF-Connecting-IP",
                "True-Client-IP"
        };

        for (String headerName : headerNames) {
            String ip = request.getHeader(headerName);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For może zawierać listę IP - weź pierwszy
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }

    private boolean isExcludedPath(String path) {
        // Wyklucz pewne endpointy z rate limiting
        return path.contains("/api/auth/login") || 
               path.contains("/api/auth/register") ||
               path.contains("/actuator/") ||
               path.contains("/health");
    }

    private void cleanupOldEntries() {
        long now = System.currentTimeMillis();
        requestCounters.entrySet().removeIf(entry -> {
            RequestCounter counter = entry.getValue();
            return now - counter.windowStart.get() > windowSizeMs * 2; // Usuń wpisy starsze niż 2 okna
        });
        log.debug("Cleaned up old rate limiting entries. Current size: {}", requestCounters.size());
    }

    private void sendRateLimitResponse(HttpServletResponse response, String clientIp) throws IOException {
        response.setStatus(429); // Too Many Requests
        response.setContentType("application/json");
        response.setHeader("Retry-After", String.valueOf(windowSizeMs / 1000));
        
        String jsonResponse = String.format(
            "{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests from IP: %s\",\"retryAfter\":%d}",
            clientIp, windowSizeMs / 1000
        );
        
        response.getWriter().write(jsonResponse);
    }
} 