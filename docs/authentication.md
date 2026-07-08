# Authentication & Authorization

The Weekly Report Generator & Team Dashboard application uses a robust, JWT-based authentication system to secure endpoints and manage user sessions.

## 1. User Registration
- **Endpoint**: `/api/auth/register`
- **Description**: Allows new users to create an account by providing their details (e.g., name, email, password).
- **Security**: Passwords are securely hashed before being stored in the database.

## 2. User Login
- **Endpoint**: `/api/auth/login`
- **Description**: Authenticates a user using their email and password.
- **Token Generation**: Upon successful login, the server issues a JSON Web Token (JWT).
- **Client-Side Storage**: The JWT is stored on the client-side (typically in local storage or cookies) and must be included in the `Authorization` header as a Bearer token for subsequent requests.

## 3. Role-Based Access Control (RBAC)
- **Roles**: Users are assigned specific roles, such as `USER` or `MANAGER`.
- **Enforcement**:
  - **Backend**: Spring Security protects API routes. Certain endpoints require the `MANAGER` role (e.g., viewing team dashboards, managing projects).
  - **Frontend**: The React application uses a `<ProtectedRoute>` wrapper component. This component checks both the authentication state and the user's role before rendering sensitive pages (like the `TeamDashboardPage` and `ProjectsPage`). Unauthenticated or unauthorized users are redirected to the login screen.

## 4. Token Validation
- The application includes a mechanism to validate tokens, ensuring that expired or tampered tokens are rejected.
- A `JwtAuthFilter` intercepts incoming HTTP requests on the backend to validate the token and populate the Security Context with the authenticated user's details.
