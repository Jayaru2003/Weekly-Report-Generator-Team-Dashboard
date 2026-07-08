# Weekly Report Generator & Team Dashboard - Features Documentation

This document outlines the core features of the Weekly Report Generator and Team Dashboard project. The application consists of a Spring Boot backend and a React/Vite frontend.

## 1. Authentication & Authorization
- **User Registration**: Users can register for a new account.
- **User Login**: JWT-based authentication allows secure access.
- **Role-Based Access Control (RBAC)**: Supports roles such as `USER` and `MANAGER`, ensuring that users only access features permitted by their role.

## 2. Weekly Reports Management
- **Create Reports**: Team members can submit weekly status reports detailing their progress, tasks completed, and any blockers.
- **View Reports**: Users can view their past reports. Managers can view reports submitted by their team members.
- **Review & Approval**: Managers can review submitted reports and have the ability to **reject** reports if they require revision.
- **Report Status Tracking**: Tracks whether reports are in Draft, Submitted, Approved, or Rejected state.

## 3. Feedback & Comments
- **Report Comments**: Managers and team members can leave comments on reports. This facilitates direct feedback loops and clarifies details regarding weekly submissions.

## 4. Projects Management
- **Project Creation & Tracking**: Managers can create and track various projects.
- **User Assignment**: Team members can be assigned to specific projects, clarifying who is working on what.
- **Project Filtering**: Features across the application can be filtered by project to focus on specific work streams.

## 5. Team Dashboard (Manager View)
The dashboard provides managers with a bird's-eye view of team performance and report submissions:
- **Dashboard Summary**: High-level metrics showing total reports, compliance, and overall progress.
- **Activity Feed**: A timeline of recent activities such as new report submissions, comments, and project assignments.
- **Submission Status**: Tracks who has submitted their weekly reports and who is pending.
- **Team Reports View**: A centralized place to browse and filter reports from all team members.
- **Trend Data**: Visualizations demonstrating report submission trends over time.
- **Workload by Project**: Visual insights into how work is distributed across different projects.

## 6. Frontend UI/UX
- **Responsive Design**: Built with React and modern CSS for a seamless experience across devices.
- **Interactive Forms**: Robust form handling for login, registration, and report creation.
- **Protected Routes**: Ensures that unauthenticated users are redirected to the login page, and role-specific routes (like Manager Dashboard) are strictly protected.
- **Visualizations & Filtering**: Includes interactive graphs and combo-box filters (by date range, team member, project) for deep-dive analysis on the dashboard.
