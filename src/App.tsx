// ─── Meridian – App Shell & Routing ──────────────────────────────────────────
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeProfile from './pages/EmployeeProfile';
import SalaryStructures from './pages/SalaryStructures';
import PayrollProcessing from './pages/PayrollProcessing';
import PayrollReadiness from './pages/PayrollReadiness';
import Payslips from './pages/Payslips';
import Reports from './pages/Reports';
import SelfService from './pages/SelfService';
import ToastContainer from './components/ui/ToastContainer';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  const currentUser = useStore((s) => s.currentUser);

  if (!currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <AppLayout>
        <Routes>
          {/* Dashboard is HR-only; employees are redirected or blocked */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['hr_admin']} moduleName="Payroll Command Center">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeProfile />} />
          <Route
            path="/salary-structures"
            element={
              <ProtectedRoute allowedRoles={['hr_admin']} moduleName="Salary Structures & Component Editor">
                <SalaryStructures />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute allowedRoles={['hr_admin']} moduleName="Monthly Payroll Processing">
                <PayrollProcessing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll-readiness"
            element={
              <ProtectedRoute allowedRoles={['hr_admin']} moduleName="Pre-Payroll Readiness Center">
                <PayrollReadiness />
              </ProtectedRoute>
            }
          />
          <Route path="/payslips" element={<Payslips />} />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['hr_admin']} moduleName="Executive Payroll Reports & Analytics">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/self-service" element={<SelfService />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <ToastContainer />
    </>
  );
}
