package com.example.userservice.controller;

import com.example.userservice.dto.response.UserSummaryResponse;
import com.example.userservice.model.User;
import com.example.userservice.security.UserPrincipal;
import com.example.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return userService.getUserById(userPrincipal.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<User> updateCurrentUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody User userDetails) {
        return ResponseEntity.ok(userService.updateUser(userPrincipal.getId(), userDetails));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort) {
        List<User> users = userService.getAllUsers(page, size, sort);
        List<UserSummaryResponse> userSummaries = users.stream()
                .map(this::convertToUserSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userSummaries);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryResponse>> searchUsers(
            @RequestParam String query) {
        List<User> users = userService.searchUsersByUsername(query);
        List<UserSummaryResponse> userSummaries = users.stream()
                .map(this::convertToUserSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userSummaries);
    }

    @PostMapping("/usernames")
    public ResponseEntity<Map<Long, String>> getUsernamesByIds(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(userService.getUsernamesByIds(userIds));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, List<String>> roleRequest) {
        List<String> roles = roleRequest.get("roles");
        boolean success = userService.changeUserRoles(id, roles);

        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    private UserSummaryResponse convertToUserSummary(User user) {
        List<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
        
        return new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roleNames,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
} 