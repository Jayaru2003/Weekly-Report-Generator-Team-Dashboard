package com.company.weeklyreport.controller;

import com.company.weeklyreport.dto.comment.CommentRequest;
import com.company.weeklyreport.dto.comment.CommentResponse;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for ReportComment management.
 *
 * <ul>
 *   <li>POST /api/reports/{reportId}/comments — MANAGER: add a comment to any report</li>
 *   <li>GET  /api/reports/{reportId}/comments — MANAGER or report owner: list comments</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/reports/{reportId}/comments")
@RequiredArgsConstructor
public class ReportCommentController {

    private final CommentService commentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('MANAGER')")
    public CommentResponse addComment(
            @PathVariable UUID reportId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User principal) {
        return commentService.addComment(reportId, request.content(), principal);
    }

    @GetMapping
    public List<CommentResponse> getComments(
            @PathVariable UUID reportId,
            @AuthenticationPrincipal User principal) {
        return commentService.getComments(reportId, principal);
    }
}
