import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { MyReportsPage } from '../features/reports/MyReportsPage';
import { ProjectsPage } from '../features/projects/ProjectsPage';
import { TeamDashboardPage } from '../features/dashboard/TeamDashboardPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="MANAGER">
            <TeamDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <MyReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute role="MANAGER">
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
