package com.example.quizservice.dto.request;

import java.util.HashSet;
import java.util.Set;

public class QuizUpdateRequest {
    private String name;
    private String description;
    private boolean isPublic;
    private Set<Long> groupIds = new HashSet<>();

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Set<Long> getGroupIds() {
        return groupIds;
    }

    public void setGroupIds(Set<Long> groupIds) {
        this.groupIds = groupIds != null ? groupIds : new HashSet<>();
    }
} 