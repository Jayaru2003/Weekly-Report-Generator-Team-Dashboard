package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.comment.CommentResponse;
import com.company.weeklyreport.entity.ReportComment;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.entity.WeeklyReport;
import com.company.weeklyreport.repository.ReportCommentRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

/**
 * Business logic for ReportComment management.
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final ReportCommentRepository commentRepository;
    private final WeeklyReportRepository  reportRepository;

    // ── Add Comment ───────────────────────────────────────────────────────────

    @Transactional
    public CommentResponse addComment(UUID reportId, String content, User author) {
        WeeklyReport report = findReportOrThrow(reportId);

        ReportComment comment = ReportComment.builder()
                .report(report)
                .author(author)
                .content(content)
                .build();

        return CommentResponse.from(commentRepository.save(comment));
    }

    // ── Get Comments ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID reportId, User principal) {
        WeeklyReport report = findReportOrThrow(reportId);

        // Members can only view comments on their own reports
        if (principal.getRole() == Role.MEMBER
                && !report.getUser().getId().equals(principal.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have permission to view comments on this report");
        }

        return commentRepository.findByReportIdOrderByCreatedAtAsc(reportId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private WeeklyReport findReportOrThrow(UUID reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Report not found: " + reportId));
    }
}
