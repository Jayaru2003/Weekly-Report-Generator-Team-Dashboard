package com.company.weeklyreport.repository;

import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    long countByRole(Role role);

    @Query("SELECT COUNT(up) FROM UserProject up WHERE up.project.id = :projectId AND up.user.role = 'MEMBER'")
    long countMembersByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(DISTINCT up.user) FROM UserProject up WHERE up.user.role = 'MEMBER'")
    long countMembersWithAtLeastOneProject();
}

