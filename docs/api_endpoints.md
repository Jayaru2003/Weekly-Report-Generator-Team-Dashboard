# API Endpoints Overview

The backend exposes a RESTful API built with Spring Boot. It uses JSON for requests and responses. All endpoints (except public auth endpoints) require a valid JWT Bearer token in the `Authorization` header.

For the full interactive documentation, run the backend and visit **Swagger UI** at `http://localhost:8080/swagger-ui.html`.

## 1. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register a new user (Member or Manager).
- `POST /api/auth/login`: Authenticate and receive a JWT token.

## 2. Users (`/api/users`)
- `GET /api/users/me`: Get current authenticated user details.
- `GET /api/users`: List users (Manager only).

## 3. Projects (`/api/projects`)
- `GET /api/projects`: List all projects.
- `GET /api/projects/{id}`: Get project details.
- `POST /api/projects`: Create a new project (Manager only).
- `PUT /api/projects/{id}`: Update an existing project (Manager only).
- `DELETE /api/projects/{id}`: Delete a project (Manager only).

## 4. Weekly Reports (`/api/reports`)
- `GET /api/reports`: List all reports (Managers see all, Members see only their own).
- `GET /api/reports/{id}`: Get a specific report.
- `POST /api/reports`: Create a new report.
- `PUT /api/reports/{id}`: Update a report (Only if Draft or Rejected).
- `PATCH /api/reports/{id}/status`: Update report status to Approved or Rejected (Manager only).

## 5. Comments (`/api/comments`)
- `GET /api/reports/{reportId}/comments`: Fetch all feedback comments for a given report.
- `POST /api/reports/{reportId}/comments`: Add a new comment to a report (Manager only).

## 6. Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats`: Retrieve statistics for the team dashboard (Manager only), including total reports, approved reports, active projects, etc.
