package com.company.weeklyreport.repository;

import com.company.weeklyreport.entity.ReportComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportCommentRepository extends JpaRepository<ReportComment, UUID> {

    /** All comments for a given report, oldest first. */
    List<ReportComment> findByReportIdOrderByCreatedAtAsc(UUID reportId);
}
