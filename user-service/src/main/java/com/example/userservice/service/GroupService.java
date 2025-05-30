package com.example.userservice.service;

import com.example.userservice.model.Group;
import com.example.userservice.model.User;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface GroupService {
    
    List<Group> getAllGroups();
    
    Optional<Group> getGroupById(Long id);
    
    Optional<Group> getGroupByName(String name);
    
    Group createGroup(String name, String description, Long userId);
    
    Group updateGroup(Long id, String name, String description);
    
    void deleteGroup(Long id);
    
    boolean addUserToGroup(Long userId, Long groupId);
    
    boolean removeUserFromGroup(Long userId, Long groupId);
    
    Set<Group> getUserGroups(Long userId);
    
    Set<User> getGroupMembers(Long groupId);
    
    boolean existsByName(String name);
} 