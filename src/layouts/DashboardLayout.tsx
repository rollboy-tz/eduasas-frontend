import { Outlet, Link } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
        <h2 className="text-xl font-bold text-blue-600 mb-6">EduAsas School</h2>
        <nav className="space-y-2 flex-1">
          <Link to="/" className="block p-2 hover:bg-blue-50 rounded text-slate-700 font-medium">Dashboard</Link>
          <Link to="/students" className="block p-2 hover:bg-blue-50 rounded text-slate-700 font-medium">Wanafunzi</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}