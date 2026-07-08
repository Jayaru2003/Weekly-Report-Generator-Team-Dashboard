package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.comment.CommentResponse;
import com.company.weeklyreport.entity.ReportComment;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.entity.WeeklyReport;
import com.company.weeklyreport.repository.ReportCommentRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CommentServiceTest {

    @Mock
    private ReportCommentRepository commentRepository;

    @Mock
    private WeeklyReportRepository reportRepository;

    @InjectMocks
    private CommentService commentService;

    private User manager;
    private User member;
    private User otherMember;
    private WeeklyReport report;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        manager = User.builder()
                .id(UUID.randomUUID())
                .firstName("Mgr")
                .lastName("One")
                .role(Role.MANAGER)
                .build();

        member = User.builder()
                .id(UUID.randomUUID())
                .firstName("Mem")
                .lastName("One")
                .role(Role.MEMBER)
                .build();

        otherMember = User.builder()
                .id(UUID.randomUUID())
                .firstName("Mem")
                .lastName("Two")
                .role(Role.MEMBER)
                .build();

        report = WeeklyReport.builder()
                .id(UUID.randomUUID())
                .user(member)
                .build();
    }

    @Test
    void testAddComment_Success() {
        UUID reportId = report.getId();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        ReportComment comment = ReportComment.builder()
                .id(UUID.randomUUID())
                .report(report)
                .author(manager)
                .content("Good work")
                .build();
        when(commentRepository.save(any(ReportComment.class))).thenReturn(comment);

        CommentResponse response = commentService.addComment(reportId, "Good work", manager);

        assertNotNull(response);
        assertEquals("Good work", response.content());
        verify(commentRepository).save(any(ReportComment.class));
    }

    @Test
    void testAddComment_ReportNotFound() {
        UUID reportId = UUID.randomUUID();
        when(reportRepository.findById(reportId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> commentService.addComment(reportId, "Nice", manager));
    }

    @Test
    void testGetComments_Manager_Success() {
        UUID reportId = report.getId();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        ReportComment comment = ReportComment.builder()
                .id(UUID.randomUUID())
                .report(report)
                .author(manager)
                .content("Fix details")
                .build();
        when(commentRepository.findByReportIdOrderByCreatedAtAsc(reportId)).thenReturn(List.of(comment));

        List<CommentResponse> comments = commentService.getComments(reportId, manager);

        assertFalse(comments.isEmpty());
        assertEquals(1, comments.size());
        assertEquals("Fix details", comments.get(0).content());
    }

    @Test
    void testGetComments_MemberOwner_Success() {
        UUID reportId = report.getId();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        ReportComment comment = ReportComment.builder()
                .id(UUID.randomUUID())
                .report(report)
                .author(manager)
                .content("Fix details")
                .build();
        when(commentRepository.findByReportIdOrderByCreatedAtAsc(reportId)).thenReturn(List.of(comment));

        List<CommentResponse> comments = commentService.getComments(reportId, member);

        assertFalse(comments.isEmpty());
        assertEquals(1, comments.size());
    }

    @Test
    void testGetComments_MemberNonOwner_Forbidden() {
        UUID reportId = report.getId();
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(report));

        assertThrows(ResponseStatusException.class, () -> commentService.getComments(reportId, otherMember));
    }
}
