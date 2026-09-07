export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-red-500">EduAsas Super Admin Panel</h1>
        <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">Admin Mode</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm">Shule Zilizosajiliwa</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-slate-400 text-sm">Watumiaji Hai</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}