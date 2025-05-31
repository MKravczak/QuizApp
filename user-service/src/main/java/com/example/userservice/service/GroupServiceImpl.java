package com.example.userservice.service;

import com.example.userservice.model.Group;
import com.example.userservice.model.User;
import com.example.userservice.repository.GroupRepository;
import com.example.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class GroupServiceImpl implements GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @Override
    public Optional<Group> getGroupById(Long id) {
        return groupRepository.findById(id);
    }

    @Override
    public Optional<Group> getGroupByName(String name) {
        return groupRepository.findByName(name);
    }

    @Override
    public Group createGroup(String name, String description, Long userId) {
        Group group = new Group(name, description, userId);
        Group savedGroup = groupRepository.save(group);
        
        // Automatycznie dodaj twórcę grupy jako członka
        addUserToGroup(userId, savedGroup.getId());
        
        return savedGroup;
    }

    @Override
    public Group updateGroup(Long id, String name, String description) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + id));
        
        group.setName(name);
        group.setDescription(description);
        
        return groupRepository.save(group);
    }

    @Override
    public void deleteGroup(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + id));
        
        // Remove all users from the group before deleting
        for (User user : group.getMembers()) {
            user.getGroups().remove(group);
        }
        
        groupRepository.delete(group);
    }

    @Override
    public boolean addUserToGroup(Long userId, Long groupId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        
        if (userOpt.isPresent() && groupOpt.isPresent()) {
            User user = userOpt.get();
            Group group = groupOpt.get();
            
            user.getGroups().add(group);
            group.getMembers().add(user);
            
            userRepository.save(user);
            return true;
        }
        
        return false;
    }

    @Override
    public boolean removeUserFromGroup(Long userId, Long groupId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        
        if (userOpt.isPresent() && groupOpt.isPresent()) {
            User user = userOpt.get();
            Group group = groupOpt.get();
            
            user.getGroups().remove(group);
            group.getMembers().remove(user);
            
            userRepository.save(user);
            return true;
        }
        
        return false;
    }

    @Override
    public Set<Group> getUserGroups(Long userId) {
        return groupRepository.findByMembersId(userId);
    }

    @Override
    public Set<User> getGroupMembers(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));
        return group.getMembers();
    }

    @Override
    public boolean existsByName(String name) {
        return groupRepository.existsByName(name);
    }
} 