package com.example.userservice.controller;

import com.example.userservice.dto.request.CreateGroupRequest;
import com.example.userservice.dto.request.UpdateGroupRequest;
import com.example.userservice.dto.response.GroupResponse;
import com.example.userservice.dto.response.MessageResponse;
import com.example.userservice.model.Group;
import com.example.userservice.model.User;
import com.example.userservice.security.UserPrincipal;
import com.example.userservice.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    
    private final GroupService groupService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<GroupResponse>> getAllGroups() {
        List<Group> groups = groupService.getAllGroups();
        List<GroupResponse> groupResponses = groups.stream()
                .map(this::convertToGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(groupResponses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<GroupResponse> getGroupById(@PathVariable Long id) {
        return groupService.getGroupById(id)
                .map(this::convertToGroupResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<GroupResponse> getGroupByName(@PathVariable String name) {
        return groupService.getGroupByName(name)
                .map(this::convertToGroupResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createGroup(@Valid @RequestBody CreateGroupRequest request, 
                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (groupService.existsByName(request.getName())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Group name is already taken!"));
        }

        Group group = groupService.createGroup(request.getName(), request.getDescription(), userPrincipal.getId());
        return ResponseEntity.ok(convertToGroupResponse(group));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateGroup(@PathVariable Long id, 
                                       @Valid @RequestBody UpdateGroupRequest request) {
        try {
            Group group = groupService.updateGroup(id, request.getName(), request.getDescription());
            return ResponseEntity.ok(convertToGroupResponse(group));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        try {
            groupService.deleteGroup(id);
            return ResponseEntity.ok(new MessageResponse("Group deleted successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addUserToGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        boolean success = groupService.addUserToGroup(userId, groupId);
        if (success) {
            return ResponseEntity.ok(new MessageResponse("User added to group successfully!"));
        } else {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User or group not found!"));
        }
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeUserFromGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        boolean success = groupService.removeUserFromGroup(userId, groupId);
        if (success) {
            return ResponseEntity.ok(new MessageResponse("User removed from group successfully!"));
        } else {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: User or group not found!"));
        }
    }

    @GetMapping("/my-groups")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<GroupResponse>> getMyGroups(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Set<Group> groups = groupService.getUserGroups(userPrincipal.getId());
        List<GroupResponse> groupResponses = groups.stream()
                .map(this::convertToGroupResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(groupResponses);
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Set<GroupResponse.UserSummary>> getGroupMembers(@PathVariable Long id) {
        try {
            Set<User> members = groupService.getGroupMembers(id);
            Set<GroupResponse.UserSummary> memberSummaries = members.stream()
                    .map(this::convertToUserSummary)
                    .collect(Collectors.toSet());
            return ResponseEntity.ok(memberSummaries);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private GroupResponse convertToGroupResponse(Group group) {
        Set<GroupResponse.UserSummary> memberSummaries = group.getMembers().stream()
                .map(this::convertToUserSummary)
                .collect(Collectors.toSet());

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                memberSummaries,
                group.getCreatedAt(),
                group.getUpdatedAt()
        );
    }

    private GroupResponse.UserSummary convertToUserSummary(User user) {
        return new GroupResponse.UserSummary(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );
    }
} 