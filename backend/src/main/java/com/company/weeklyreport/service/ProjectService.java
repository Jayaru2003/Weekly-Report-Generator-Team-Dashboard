package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.project.ProjectRequest;
import com.company.weeklyreport.dto.project.ProjectResponse;
import com.company.weeklyreport.entity.Project;
import com.company.weeklyreport.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Business logic for Project management.
 */
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        validateNoDuplicateActiveName(request.name(), null);

        Project project = Project.builder()
                .name(request.name().trim())
                .description(request.description())
                .isActive(true)
                .build();

        return ProjectResponse.from(projectRepository.save(project));
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProjectResponse> listActiveProjects() {
        return projectRepository.findByIsActiveTrue()
                .stream()
                .map(ProjectResponse::from)
                .toList();
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Transactional
    public ProjectResponse updateProject(UUID id, ProjectRequest request) {
        Project project = findOrThrow(id);
        validateNoDuplicateActiveName(request.name(), id);

        project.setName(request.name().trim());
        project.setDescription(request.description());

        return ProjectResponse.from(projectRepository.save(project));
    }

    // ── Soft Delete ───────────────────────────────────────────────────────────

    @Transactional
    public void softDeleteProject(UUID id) {
        Project project = findOrThrow(id);
        project.setIsActive(false);
        projectRepository.save(project);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Project findOrThrow(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Project not found: " + id));
    }

    /**
     * Ensures no other active project already uses this name (case-insensitive).
     * @param excludeId the ID of the project being updated (null for create).
     */
    private void validateNoDuplicateActiveName(String name, UUID excludeId) {
        boolean duplicate = projectRepository.findByIsActiveTrue()
                .stream()
                .filter(p -> excludeId == null || !p.getId().equals(excludeId))
                .anyMatch(p -> p.getName().equalsIgnoreCase(name.trim()));

        if (duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An active project with the name '" + name + "' already exists");
        }
    }
}
