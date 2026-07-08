package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.project.ProjectRequest;
import com.company.weeklyreport.dto.project.ProjectResponse;
import com.company.weeklyreport.entity.Project;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.entity.UserProject;
import com.company.weeklyreport.repository.ProjectRepository;
import com.company.weeklyreport.repository.UserRepository;
import com.company.weeklyreport.repository.UserProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProjectRepository userProjectRepository;

    @InjectMocks
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateProject_Success() {
        ProjectRequest request = new ProjectRequest("Beta Project", "Description beta");
        when(projectRepository.findByIsActiveTrue()).thenReturn(new ArrayList<>());
        
        Project saved = Project.builder()
                .id(UUID.randomUUID())
                .name("Beta Project")
                .description("Description beta")
                .isActive(true)
                .build();
        when(projectRepository.save(any(Project.class))).thenReturn(saved);

        ProjectResponse response = projectService.createProject(request);

        assertNotNull(response);
        assertEquals("Beta Project", response.name());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void testCreateProject_DuplicateName() {
        ProjectRequest request = new ProjectRequest("Beta Project", "Description beta");
        Project existing = Project.builder()
                .id(UUID.randomUUID())
                .name("Beta Project")
                .isActive(true)
                .build();
        when(projectRepository.findByIsActiveTrue()).thenReturn(List.of(existing));

        assertThrows(ResponseStatusException.class, () -> projectService.createProject(request));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void testListActiveProjects() {
        Project active = Project.builder()
                .id(UUID.randomUUID())
                .name("Active Project")
                .isActive(true)
                .build();
        when(projectRepository.findByIsActiveTrue()).thenReturn(List.of(active));

        List<ProjectResponse> list = projectService.listActiveProjects();

        assertFalse(list.isEmpty());
        assertEquals(1, list.size());
        assertEquals("Active Project", list.get(0).name());
    }

    @Test
    void testSoftDeleteProject() {
        UUID id = UUID.randomUUID();
        Project existing = Project.builder()
                .id(id)
                .name("ToDelete Project")
                .isActive(true)
                .build();
        when(projectRepository.findById(id)).thenReturn(Optional.of(existing));

        projectService.softDeleteProject(id);

        assertFalse(existing.getIsActive());
        verify(projectRepository).save(existing);
    }

    @Test
    void testUpdateProjectMembers() {
        UUID projectId = UUID.randomUUID();
        Project project = Project.builder().id(projectId).name("P1").build();
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).firstName("U1").build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        when(userProjectRepository.findByProjectId(projectId)).thenReturn(new ArrayList<>());

        projectService.updateProjectMembers(projectId, List.of(userId));

        verify(userProjectRepository).deleteAll(anyList());
        verify(userProjectRepository).save(any(UserProject.class));
    }
}
