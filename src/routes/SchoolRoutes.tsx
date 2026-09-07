import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import SchoolDashboard from '@/pages/school/SchoolDashboard';
import StudentsPage from '@/pages/school/StudentsPage';
import { SchoolSubdomainGuard} from '@/layouts/SchoolSubdomainGuard';
import { SchoolNotFound, SchoolProfilePage } from '@/pages/school';

export function SchoolRoutes() {
  return (
    <Routes>
      {/* Layout kuu yenye Sidebar na Navbar */}
      <Route element={<SchoolSubdomainGuard />} >
        <Route path="school-not-found" element={<SchoolNotFound />} />
        <Route element={<DashboardLayout />} >
          <Route element={<SchoolProfilePage />} index />
          <Route element={<SchoolDashboard />}  />
          <Route element={<StudentsPage />} path="students" />
        </Route>

        {/* Fallback ya kurasa zote ambazo hazipo kwenye School */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}