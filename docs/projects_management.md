# Projects Management

To better organize work and filter reports, the application includes a comprehensive Projects Management module.

## 1. Project Creation
- **Endpoint**: `/api/projects`
- **Description**: Managers have the authority to create new projects within the system. Projects act as logical groupings for tasks and reports.
- **Details**: A project typically includes a name, description, and status.

## 2. User Assignment
- **Endpoint**: `/api/projects/{projectId}/users`
- **Description**: Once a project is created, managers can assign specific team members to it.
- **Database Mapping**: This is handled via a `UserProject` entity, creating a many-to-many relationship between Users and Projects. This clarifies exactly who is contributing to which initiative.

## 3. Project Filtering
- Projects serve as a primary filtering dimension across the application.
- On the **Team Dashboard**, managers can filter metrics, workload, and activity feeds by specific projects.
- When viewing reports, users can filter to see only reports related to a particular project.
