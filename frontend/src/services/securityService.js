// Security Service - generuje wymagane nagłówki bezpieczeństwa
class SecurityService {
    constructor() {
        this.secret = 'MIkolajKrawczakClientSecret2025AntiPostmanProtectionAdvancedSecurity'; // Ten sam co w backendzie
    }

    // Generuje timestamp
    generateTimestamp() {
        return Date.now().toString();
    }

    // Generuje podpis klienta - używa tej samej logiki co backend Java
    generateClientSignature(timestamp, path) {
        // Backend: Integer.toHexString((timestamp + path + clientSecret).hashCode())
        const data = timestamp + path + this.secret;
        const hash = this.javaStringHashCode(data);
        // Java Integer.toHexString traktuje int jako unsigned 32-bit
        return (hash >>> 0).toString(16);
    }

    // Implementacja Java String.hashCode() w JavaScript
    javaStringHashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit signed integer
        }
        
        return hash;
    }

    // Główna funkcja do generowania wszystkich nagłówków bezpieczeństwa
    getSecurityHeaders(url) {
        const path = new URL(url, window.location.origin).pathname;
        const timestamp = this.generateTimestamp();
        const signature = this.generateClientSignature(timestamp, path);

        console.log('🔒 Security headers generated:', {
            path,
            timestamp,
            signature,
            secret: this.secret.substring(0, 20) + '...'
        });

        return {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Signature': signature,
            'X-Timestamp': timestamp,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': navigator.language || 'en-US,en;q=0.9'
        };
    }

    // Sprawdza czy jesteśmy w dozwolonym środowisku
    isValidEnvironment() {
        const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
        return allowedOrigins.includes(window.location.origin);
    }

    // Dodaje wszystkie wymagane nagłówki do żądania
    enhanceRequestConfig(config) {
        if (!this.isValidEnvironment()) {
            console.warn('Application is running in non-allowed environment');
        }

        const securityHeaders = this.getSecurityHeaders(config.url);
        
        config.headers = {
            ...config.headers,
            ...securityHeaders
        };

        return config;
    }
}

// Eksport instancji singleton
const securityService = new SecurityService();
export default securityService; 