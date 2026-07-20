import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Pengajuan', value: stats.pengajuanCount, to: '/admin/intern-forms?status=pengajuan', color: 'text-clay' },
        { label: 'Aktif', value: stats.aktifCount, to: '/admin/intern-forms?status=aktif', color: 'text-signal' },
        { label: 'Alumni', value: stats.alumniCount, to: '/admin/intern-forms?status=alumni', color: 'text-moss' },
        { label: 'Total Mahasiswa', value: stats.totalUsers, to: '/admin/intern-forms', color: 'text-ink' },
        { label: 'Total Laporan', value: stats.totalReports, to: '/admin/reports', color: 'text-ink' },
        { label: 'Laporan Menunggu', value: stats.pendingReports, to: '/admin/reports?status=submitted', color: 'text-signal' },
      ]
    : [];

  return (
    <AdminLayout>
      <h1 className="font-display font-bold text-2xl mb-1">Dashboard Admin</h1>
      <p className="text-ink/50 mb-8">Ringkasan data mahasiswa magang BID TIK.</p>

      {loading ? (
        <p className="text-ink/40 text-sm">Memuat...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link key={c.label} to={c.to} className="card p-6 hover:shadow-md transition-shadow">
              <p className="text-ink/40 text-xs uppercase tracking-wide mb-2">{c.label}</p>
              <p className={`font-display font-extrabold text-3xl ${c.color}`}>{c.value}</p>
            </Link>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
