package com.example.userservice.repository;

import com.example.userservice.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    
    Optional<Group> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT g FROM Group g JOIN g.members u WHERE u.id = :userId")
    Set<Group> findByMembersId(@Param("userId") Long userId);
} 