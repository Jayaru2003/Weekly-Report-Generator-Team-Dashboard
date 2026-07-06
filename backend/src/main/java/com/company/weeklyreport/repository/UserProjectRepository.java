package com.company.weeklyreport.repository;

import com.company.weeklyreport.entity.UserProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProjectRepository extends JpaRepository<UserProject, UUID> {

    List<UserProject> findByUserId(UUID userId);

    List<UserProject> findByProjectId(UUID projectId);

    Optional<UserProject> findByUserIdAndProjectId(UUID userId, UUID projectId);

    boolean existsByUserIdAndProjectId(UUID userId, UUID projectId);
}
