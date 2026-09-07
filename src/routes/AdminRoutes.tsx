import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '@/pages/admin/AdminDashboard';

export function AdminRoutes() {
  return (
    <Routes>
      <Route  path="/" element={<AdminDashboard />} />
      <Route  path="*" element={<Navigate to="/" replace/>} />
    </Routes>
  );
}