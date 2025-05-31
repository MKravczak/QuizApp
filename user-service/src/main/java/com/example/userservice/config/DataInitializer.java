package com.example.userservice.config;

import com.example.userservice.model.ERole;
import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.repository.RoleRepository;
import com.example.userservice.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        
        initRoles();
        
        createUserIfNotExists(
                "admin",
                "admin@example.com",
                "admin",
                Collections.singleton(getRoleByName(ERole.ROLE_ADMIN))
        );
        
        createUserIfNotExists(
                "user",
                "user@example.com",
                "user123",
                Collections.singleton(getRoleByName(ERole.ROLE_USER))
        );
        
        log.info("Inicjalizacja danych zakończona pomyślnie");
    }

    private void initRoles() {
        createRoleIfNotExists(ERole.ROLE_USER);
        createRoleIfNotExists(ERole.ROLE_ADMIN);
    }

    private void createRoleIfNotExists(ERole roleName) {
        Optional<Role> existingRole = roleRepository.findByName(roleName);
        if (existingRole.isEmpty()) {
            Role role = new Role(roleName);
            roleRepository.save(role);
            log.info("Utworzono rolę: {}", roleName);
        }
    }

    private Role getRoleByName(ERole roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Rola " + roleName + " nie została znaleziona"));
    }

    private void createUserIfNotExists(String username, String email, String password, Set<Role> roles) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        
        if (existingUser.isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRoles(roles);
            userRepository.save(user);
            log.info("Utworzono użytkownika: {}", username);
        }
    }
} 