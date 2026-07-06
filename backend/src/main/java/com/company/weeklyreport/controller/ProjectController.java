package com.company.weeklyreport.controller;

import com.company.weeklyreport.dto.project.ProjectRequest;
import com.company.weeklyreport.dto.project.ProjectResponse;
import com.company.weeklyreport.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for Project management.
 *
 * <ul>
 *   <li>GET    /api/projects       — list active projects (any authenticated user)</li>
 *   <li>POST   /api/projects       — create project (MANAGER only)</li>
 *   <li>PUT    /api/projects/{id}  — update project (MANAGER only)</li>
 *   <li>DELETE /api/projects/{id}  — soft-delete project (MANAGER only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectResponse> listProjects() {
        return projectService.listActiveProjects();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public ProjectResponse createProject(@Valid @RequestBody ProjectRequest request) {
        return projectService.createProject(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ProjectResponse updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('MANAGER')")
    public void deleteProject(@PathVariable UUID id) {
        projectService.softDeleteProject(id);
    }

    @PutMapping("/{id}/members")
    @PreAuthorize("hasRole('MANAGER')")
    public void updateProjectMembers(
            @PathVariable UUID id,
            @RequestBody List<UUID> userIds) {
        projectService.updateProjectMembers(id, userIds);
    }
}
