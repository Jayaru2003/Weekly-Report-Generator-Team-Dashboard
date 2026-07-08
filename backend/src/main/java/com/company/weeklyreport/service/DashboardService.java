package com.company.weeklyreport.service;

import com.company.weeklyreport.dto.dashboard.*;
import com.company.weeklyreport.entity.ReportStatus;
import com.company.weeklyreport.entity.Role;
import com.company.weeklyreport.entity.User;
import com.company.weeklyreport.entity.WeeklyReport;
import com.company.weeklyreport.repository.UserRepository;
import com.company.weeklyreport.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WeeklyReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TeamReportResponse> getReports(
            LocalDate week,
            UUID userId,
            UUID projectId,
            LocalDate startDate,
            LocalDate endDate) {

        List<User> members = userRepository.findByRole(Role.MEMBER);
        if (userId != null) {
            members = members.stream()
                    .filter(u -> u.getId().equals(userId))
                    .collect(Collectors.toList());
        }

        // Resolve week boundaries
        LocalDate resolvedWeekStart = week != null ? week : (startDate != null ? startDate : getStartOfCurrentWeek());
        LocalDate resolvedWeekEnd   = week != null ? week.plusDays(6) : (endDate != null ? endDate : getEndOfCurrentWeek());

        // Fetch all reports that fall within the resolved date range
        List<WeeklyReport> baseReports = reportRepository.findByWeekStartDateBetween(resolvedWeekStart, resolvedWeekEnd);

        List<TeamReportResponse> result = new ArrayList<>();

        for (User member : members) {
            // Find all projects we care about for this member
            Set<com.company.weeklyreport.entity.Project> targetProjects = new LinkedHashSet<>();

            // 1. Projects the member is assigned to
            member.getUserProjects().stream()
                    .map(com.company.weeklyreport.entity.UserProject::getProject)
                    .forEach(targetProjects::add);

            // 2. Projects the member has submitted/drafted reports for in the resolved week range
            baseReports.stream()
                    .filter(r -> r.getUser().getId().equals(member.getId()))
                    .map(WeeklyReport::getProject)
                    .forEach(targetProjects::add);

            // Filter projects by target projectId if specified
            if (projectId != null) {
                targetProjects = targetProjects.stream()
                        .filter(p -> p.getId().equals(projectId))
                        .collect(Collectors.toSet());
            }

            for (com.company.weeklyreport.entity.Project proj : targetProjects) {
                List<WeeklyReport> memberProjReports = baseReports.stream()
                        .filter(r -> r.getUser().getId().equals(member.getId()))
                        .filter(r -> r.getProject().getId().equals(proj.getId()))
                        .collect(Collectors.toList());

                if (memberProjReports.isEmpty()) {
                    boolean isLate = LocalDate.now().isAfter(resolvedWeekEnd.plusDays(1));
                    result.add(new TeamReportResponse(
                            null,
                            member.getId(),
                            member.getFirstName(),
                            member.getLastName(),
                            member.getEmail(),
                            proj.getId(),
                            proj.getName(),
                            resolvedWeekStart,
                            resolvedWeekEnd,
                            null, null, null, null, null,
                            isLate ? "LATE" : "PENDING",
                            null
                    ));
                } else {
                    for (WeeklyReport r : memberProjReports) {
                        String calculatedStatus;
                        if (r.getStatus() == ReportStatus.SUBMITTED || r.getStatus() == ReportStatus.APPROVED || r.getStatus() == ReportStatus.REJECTED) {
                            calculatedStatus = r.getStatus().name();
                        } else if (LocalDate.now().isAfter(r.getWeekEndDate().plusDays(1))) {
                            calculatedStatus = "LATE";
                        } else {
                            calculatedStatus = "PENDING";
                        }
                        result.add(new TeamReportResponse(
                                r.getId(),
                                member.getId(),
                                member.getFirstName(),
                                member.getLastName(),
                                member.getEmail(),
                                r.getProject().getId(),
                                r.getProject().getName(),
                                r.getWeekStartDate(),
                                r.getWeekEndDate(),
                                r.getTasksCompleted(),
                                r.getTasksPlanned(),
                                r.getBlockers(),
                                r.getHoursWorked(),
                                r.getNotes(),
                                calculatedStatus,
                                r.getSubmittedAt()
                        ));
                    }
                }
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(LocalDate week, UUID projectId) {
        LocalDate resolvedWeek = week != null ? week : getStartOfCurrentWeek();

        long totalTeamMembers;
        long totalReportsSubmitted;
        long distinctUsersSubmitted;
        long openBlockersCount;

        if (projectId != null) {
            totalTeamMembers = userRepository.countMembersByProjectId(projectId);
            totalReportsSubmitted = reportRepository.countByWeekStartDateAndProjectIdAndStatusIn(resolvedWeek, projectId, Arrays.asList(ReportStatus.SUBMITTED, ReportStatus.APPROVED));
            distinctUsersSubmitted = reportRepository.countDistinctUsersSubmittedForWeekAndProject(resolvedWeek, projectId);
            openBlockersCount = reportRepository.countOpenBlockersForProject(resolvedWeek, projectId);
        } else {
            totalTeamMembers       = userRepository.countMembersWithAtLeastOneProject();
            totalReportsSubmitted  = reportRepository.countByWeekStartDateAndStatusIn(resolvedWeek, Arrays.asList(ReportStatus.SUBMITTED, ReportStatus.APPROVED));
            distinctUsersSubmitted = reportRepository.countDistinctUsersSubmittedForWeek(resolvedWeek);
            openBlockersCount      = reportRepository.countOpenBlockers(resolvedWeek);
        }

        double complianceRate = totalTeamMembers > 0
                ? Math.round((distinctUsersSubmitted * 100.0 / totalTeamMembers) * 10.0) / 10.0
                : 0.0;

        return new DashboardSummaryResponse(
                totalReportsSubmitted,
                totalTeamMembers,
                complianceRate,
                openBlockersCount
        );
    }

    @Transactional(readOnly = true)
    public List<TrendDataResponse> getTrends(LocalDate startDate, LocalDate endDate, UUID userId, UUID projectId) {
        LocalDate start = startDate != null ? startDate : getStartOfCurrentWeek().minusWeeks(7);
        LocalDate end   = endDate   != null ? endDate   : getEndOfCurrentWeek();

        List<WeeklyReport> reports = reportRepository.findByTrendsFilter(
                Arrays.asList(ReportStatus.SUBMITTED, ReportStatus.APPROVED), 
                start, end, userId, projectId);

        Map<LocalDate, Integer> weeklyCounts = reports.stream()
                .collect(Collectors.groupingBy(
                        WeeklyReport::getWeekStartDate,
                        Collectors.summingInt(r -> countTasks(r.getTasksCompleted()))
                ));

        List<TrendDataResponse> result = new ArrayList<>();
        LocalDate cur = start;
        while (!cur.isAfter(end)) {
            result.add(new TrendDataResponse(cur, weeklyCounts.getOrDefault(cur, 0)));
            cur = cur.plusWeeks(1);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<SubmissionStatusResponse> getSubmissionStatus(LocalDate week, UUID projectId) {
        LocalDate resolvedWeek = week != null ? week : getStartOfCurrentWeek();

        List<User> members = userRepository.findByRole(Role.MEMBER);

        List<WeeklyReport> reports;
        if (projectId != null) {
            reports = reportRepository.findByWeekStartDateAndProjectId(resolvedWeek, projectId);
            
            // Filter members to those assigned to the project OR those who submitted/drafted a report for it
            final UUID targetProjectId = projectId;
            members = members.stream()
                    .filter(u -> u.getUserProjects().stream().anyMatch(up -> up.getProject().getId().equals(targetProjectId))
                            || reports.stream().anyMatch(r -> r.getUser().getId().equals(u.getId())))
                    .collect(Collectors.toList());
        } else {
            reports = reportRepository.findByWeekStartDate(resolvedWeek);
            
            // Filter members to those who have at least one project OR have submitted/drafted a report
            members = members.stream()
                    .filter(u -> !u.getUserProjects().isEmpty() || reports.stream().anyMatch(r -> r.getUser().getId().equals(u.getId())))
                    .collect(Collectors.toList());
        }

        List<SubmissionStatusResponse> result = new ArrayList<>();
        LocalDate weekEndDate = resolvedWeek.plusDays(6);
        boolean isPastDeadline = LocalDate.now().isAfter(weekEndDate.plusDays(1));

        for (User member : members) {
            // APPROVED and REJECTED both count as "submitted" for compliance purposes
            java.util.Optional<WeeklyReport> memberReport = reports.stream()
                    .filter(r -> r.getUser().getId().equals(member.getId()))
                    .filter(r -> r.getStatus() == ReportStatus.SUBMITTED
                             || r.getStatus() == ReportStatus.APPROVED
                             || r.getStatus() == ReportStatus.REJECTED)
                    .findFirst();

            String status;
            if (memberReport.isPresent()) {
                // Show the actual status (SUBMITTED / APPROVED / REJECTED)
                status = memberReport.get().getStatus().name();
            } else {
                status = isPastDeadline ? "LATE" : "PENDING";
            }
            result.add(new SubmissionStatusResponse(
                    member.getId(),
                    member.getFirstName() + " " + member.getLastName(),
                    status
            ));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<WorkloadByProjectResponse> getWorkloadByProject(LocalDate week, UUID projectId) {
        LocalDate resolvedWeek = week != null ? week : getStartOfCurrentWeek();
        if (projectId != null) {
            return reportRepository.getWorkloadByMemberForProject(resolvedWeek, projectId);
        } else {
            return reportRepository.getWorkloadByProject(resolvedWeek, null);
        }
    }

    @Transactional(readOnly = true)
    public List<ActivityFeedResponse> getActivityFeed(int limit) {
        List<WeeklyReport> reports = reportRepository.findRecentSubmissions(PageRequest.of(0, limit));
        return reports.stream()
                .map(r -> new ActivityFeedResponse(
                        r.getUser().getFirstName() + " " + r.getUser().getLastName(),
                        r.getProject().getName(),
                        r.getSubmittedAt()
                ))
                .collect(Collectors.toList());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private LocalDate getStartOfCurrentWeek() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private LocalDate getEndOfCurrentWeek() {
        return getStartOfCurrentWeek().plusDays(6);
    }

    private int countTasks(String tasksCompleted) {
        if (tasksCompleted == null || tasksCompleted.isBlank()) return 0;
        long count = Arrays.stream(tasksCompleted.split("\\r?\\n"))
                .filter(line -> !line.isBlank())
                .count();
        return (int) count;
    }
}
