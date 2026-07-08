# Weekly Reports Management

The core feature of the application is the submission and management of weekly status reports.

## 1. Report Creation
- **Endpoint**: `/api/reports` (POST)
- **Description**: Team members can create and submit their weekly reports.
- **Details Captured**: Reports typically include tasks completed, ongoing progress, upcoming goals, and any blockers or challenges faced during the week.

## 2. Viewing Reports
- **My Reports**: Users have a dedicated view (`MyReportsPage`) where they can see all the reports they have submitted historically.
- **Team Reports**: Managers can view reports submitted by any member of their team, allowing them to monitor progress and identify bottlenecks.

## 3. Report Status Tracking
Reports transition through various states to indicate their current stage in the workflow:
- **Draft**: The report is being worked on and hasn't been officially submitted.
- **Submitted**: The user has finalized the report and sent it for review.
- **Approved**: The manager has reviewed and accepted the report.
- **Rejected**: The manager has sent the report back for revisions (see Review & Approval).

## 4. Review & Approval Process
- Managers are responsible for reviewing submitted reports.
- If a report lacks detail or needs correction, a manager can **reject** it.
- **Rejection Flow**: When rejecting a report, the manager typically provides a reason or comment, prompting the original author to make necessary updates and resubmit.
