# Weekly Report Generator & Team Dashboard

A full-stack team reporting system featuring role-based authentication, weekly report management, project tracking, analytics dashboards, and AI-assisted insights.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Database Setup](#1-database-setup)
   - [Option A: Local PostgreSQL (Recommended for Local Dev)](#option-a-local-postgresql-recommended-for-local-dev)
   - [Option B: Hosted PostgreSQL (Supabase / Neon)](#option-b-hosted-postgresql-supabase--neon)
3. [Installing Dependencies](#2-installing-dependencies)
   - [Frontend Dependencies](#frontend-dependencies)
   - [Backend Dependencies](#backend-dependencies)
4. [Running the Backend (Spring Boot)](#3-running-the-backend-spring-boot)
   - [Environment Configuration](#environment-configuration)
   - [Run the Application](#run-the-application)
   - [API Documentation (Swagger UI)](#api-documentation-swagger-ui)
5. [Running the Frontend (Vite + React)](#4-running-the-frontend-vite--react)
   - [Configuration](#configuration-1)
   - [Run the Dev Server](#run-the-dev-server)
6. [Getting Started & User Roles](#-getting-started--user-roles)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your local machine:

* **Java Development Kit (JDK) 17** or higher
* **Node.js** (v18.x or higher) and **npm**
* **Maven** (optional, if you want to use global `mvn` command, otherwise you can run via IDE)
* **PostgreSQL** (v14 or higher, if running a local database) or a **Supabase** account (for hosted DB)
* An IDE of your choice (e.g., IntelliJ IDEA, VS Code, or Eclipse)

---

## 1. Database Setup

The backend application is configured to use **PostgreSQL**. You can either set up a local database instance or connect to a hosted instance (e.g., Supabase, Neon).

> [!NOTE]  
> The backend uses Hibernate's `ddl-auto: update` feature. This means that once the database connection is established, the required tables, keys, and constraints will be **automatically created** on the backend's first startup. You do not need to run manual SQL schema creation scripts.

### Option A: Local PostgreSQL (Recommended for Local Dev)

1. Ensure your local PostgreSQL service is running.
2. Log into your PostgreSQL instance (e.g., via `psql` or **pgAdmin**) and create a new database:
   ```sql
   CREATE DATABASE weekly_report_db;
   ```
3. Take note of your database credentials:
   * **URL**: `jdbc:postgresql://localhost:5432/weekly_report_db`
   * **Username**: `postgres` (or your custom username)
   * **Password**: `your_password`

### Option B: Hosted PostgreSQL (Supabase / Neon)

1. Create a project on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
2. Navigate to your project settings to retrieve the **JDBC Connection String**.
3. Format of the URL for Supabase:
   ```text
   jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres?sslmode=require
   ```
4. Note down your database password.
Jayaru#20031105
---

## 2. Installing Dependencies

The project is split into a frontend React application and a backend Spring Boot application.

### Frontend Dependencies

Navigate to the `frontend` directory and install the Node.js packages:

```bash
cd frontend
npm install
```

### Backend Dependencies

Navigate to the `backend` directory. If you are using Maven on your command line, download the dependencies and compile:

```bash
cd backend
mvn clean install -DskipTests
```

*(If you are using an IDE like IntelliJ IDEA or VS Code, you can simply open the `backend` directory as a Maven project, and your IDE will download the dependencies automatically.)*

---

## 3. Running the Backend (Spring Boot)

The Spring Boot application runs on port `8080` by default.

### Environment Configuration

The backend looks for a few environment variables to establish a connection to the database and sign JWT auth tokens. 

1. Navigate to the `backend` directory.
2. Copy the `.env.example` file to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and fill in your values:
   ```env
   # Database connection configuration
   DB_URL=jdbc:postgresql://localhost:5432/weekly_report_db
   DB_USERNAME=postgres
   DB_PASSWORD=your_database_password_here

   # Secret key used to sign JWTs (generate a secure 256-bit key)
   JWT_SECRET=your_jwt_secret_key_at_least_32_characters_long
   ```

> [!IMPORTANT]  
> If you run the Spring Boot application from the command line, make sure to load the `.env` variables into your environment first, or pass them as system properties:
> ```bash
> mvn spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.url=jdbc:postgresql://localhost:5432/weekly_report_db --spring.datasource.username=postgres --spring.datasource.password=your_password --application.jwt.secret=your_jwt_secret"
> ```
> Alternatively, if you run via an IDE (like IntelliJ IDEA or VS Code), install a dotenv plugin or add these environment variables directly to your Run/Debug configurations.

### Run the Application

In the `backend` directory, start the server:

```bash
mvn spring-boot:run
```

Once started successfully, you will see a console message indicating that the application is running on port `8080`.

### API Documentation (Swagger UI)

With the backend running, you can explore and test the REST API endpoints interactively via Swagger UI:
* **Swagger UI URL**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **OpenAPI Docs**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 4. Running the Frontend (Vite + React)

The frontend is a Vite-powered React application that runs on port `5173` by default.

### Configuration

Ensure the API base URL is pointed to your backend. 

1. Open the `frontend/.env` file.
2. Confirm the variable points to your local backend API context:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

### Run the Dev Server

In the `frontend` directory, start the Vite development server:

```bash
npm run dev
```

Once running, open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🚀 Getting Started & User Roles

When you first launch the application, you will be redirected to the `/login` screen.

1. Navigate to the **Register** page (`http://localhost:5173/register`).
2. Create your user account and choose one of the roles:
   * **`MEMBER`**: Regular team member. Members can:
     * Write, edit, and submit their weekly reports.
     * View their own submission history.
     * View feedback and status (Draft, Submitted, Approved, Rejected) of their reports.
   * **`MANAGER`**: Elevate access level. Managers can:
     * Access the **Team Dashboard** to see overall progress and metrics.
     * View, approve, or reject team weekly reports.
     * Leave comments/feedback on reports.
     * Create and manage **Projects** and assign members to them.
3. Once registered, log in to start using the system!
