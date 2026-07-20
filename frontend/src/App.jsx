import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/user/Login.jsx';
import Register from './pages/user/Register.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import InternForm from './pages/user/InternForm.jsx';
import ReportsIndex from './pages/user/reports/ReportsIndex.jsx';
import ReportCreate from './pages/user/reports/ReportCreate.jsx';
import ReportEdit from './pages/user/reports/ReportEdit.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import InternForms from './pages/admin/InternForms.jsx';
import EditInternForm from './pages/admin/EditInternForm.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import ReportReview from './pages/admin/ReportReview.jsx';
import CreateUser from './pages/admin/CreateUser.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Mahasiswa */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/form"
        element={
          <ProtectedRoute>
            <InternForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsIndex />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/create"
        element={
          <ProtectedRoute>
            <ReportCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:id/edit"
        element={
          <ProtectedRoute>
            <ReportEdit />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/intern-forms"
        element={
          <ProtectedRoute adminOnly>
            <InternForms />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/intern-forms/:id"
        element={
          <ProtectedRoute adminOnly>
            <EditInternForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute adminOnly>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports/:id"
        element={
          <ProtectedRoute adminOnly>
            <ReportReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-user"
        element={
          <ProtectedRoute adminOnly>
            <CreateUser />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
