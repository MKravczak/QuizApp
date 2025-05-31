package com.example.userservice.service;

import com.example.userservice.model.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers(int page, int size, String sortBy);
    
    Optional<User> getUserById(Long id);
    
    Optional<User> getUserByUsername(String username);
    
    List<User> searchUsersByUsername(String searchTerm);
    
    User updateUser(Long id, User userDetails);
    
    void deleteUser(Long id);
    
    boolean changeUserRoles(Long id, List<String> roles);
    
    Map<Long, String> getUsernamesByIds(List<Long> userIds);
    
    boolean isUserAdmin(Long userId);
} 