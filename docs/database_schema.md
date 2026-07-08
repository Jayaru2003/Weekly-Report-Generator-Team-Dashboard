# Database Schema

The Weekly Report Generator & Team Dashboard application uses PostgreSQL as its primary database. The schema is automatically managed and updated by Hibernate using `spring.jpa.hibernate.ddl-auto=update` in the backend Spring Boot configuration.

## Key Entities

### 1. `User`
Stores the system users (Members and Managers).
- **id**: Primary Key (UUID)
- **name**: User's full name
- **email**: Unique email address used for login
- **password**: Hashed password
- **role**: Enum (`MEMBER`, `MANAGER`)
- **createdAt / updatedAt**: Timestamps

### 2. `Project`
Represents the projects teams are working on.
- **id**: Primary Key (UUID)
- **name**: Project title
- **description**: Project details
- **manager**: Foreign Key to `User` (the manager who created the project)
- **createdAt / updatedAt**: Timestamps

### 3. `UserProject`
A mapping table for the many-to-many relationship between `User` and `Project`. Indicates which members are assigned to which projects.
- **id**: Primary Key
- **user**: Foreign Key to `User`
- **project**: Foreign Key to `Project`

### 4. `WeeklyReport`
Stores the weekly progress reports submitted by members.
- **id**: Primary Key (UUID)
- **user**: Foreign Key to `User` (the author)
- **project**: Foreign Key to `Project` (optional, if linked to a specific project)
- **summary**: Text description of what was achieved
- **status**: Enum (`DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`)
- **weekStartDate / weekEndDate**: The reporting period dates
- **createdAt / updatedAt**: Timestamps

### 5. `ReportComment`
Comments or feedback left by a Manager on a Member's Weekly Report.
- **id**: Primary Key (UUID)
- **report**: Foreign Key to `WeeklyReport`
- **author**: Foreign Key to `User` (usually Manager)
- **content**: The comment text
- **createdAt**: Timestamp

## Relationships
- **User (1) to Many (Project)**: A Manager can create multiple projects.
- **User (Many) to Many (Project)**: A Member can be assigned to multiple projects (via `UserProject`).
- **User (1) to Many (WeeklyReport)**: A Member submits many reports over time.
- **WeeklyReport (1) to Many (ReportComment)**: A single report can have multiple feedback comments from a manager.
