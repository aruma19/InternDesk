import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import UserLayout from '../../../components/UserLayout.jsx';
import StatusBadge from '../../../components/StatusBadge.jsx';

export default function ReportsIndex() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    setLoading(true);
    api
      .get('/reports')
      .then(({ data }) => setReports(data.reports))
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat laporan.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!window.confirm('Hapus laporan ini?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/reports/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus laporan.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <UserLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1">Laporan Magang</h1>
          <p className="text-ink/50">Riwayat laporan harian/mingguan kamu.</p>
        </div>
        <Link to="/reports/create" className="btn btn-signal">
          + Buat Laporan
        </Link>
      </div>

      {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {loading ? (
        <p className="text-ink/40 text-sm">Memuat...</p>
      ) : reports.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display font-semibold text-lg mb-2">Belum ada laporan</p>
          <p className="text-ink/50 text-sm mb-5">Mulai buat laporan magang pertamamu.</p>
          <Link to="/reports/create" className="btn btn-signal">
            Buat Laporan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="font-semibold">{new Date(r.report_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-sm text-ink/60 line-clamp-2 max-w-2xl">{r.description}</p>
                {r.admin_feedback && (
                  <p className="text-xs text-ink/40 mt-2">
                    <span className="font-medium text-ink/60">Catatan admin: </span>
                    {r.admin_feedback}
                  </p>
                )}
                {r.files?.length > 0 && (
                  <p className="text-xs text-ink/40 mt-1.5">{r.files.length} lampiran file</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/reports/${r.id}/edit`} className="btn btn-ghost text-xs !px-3 !py-1.5">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="btn btn-danger text-xs !px-3 !py-1.5"
                >
                  {deletingId === r.id ? '...' : 'Hapus'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
