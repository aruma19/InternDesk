import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUS_OPTIONS = ['draft', 'submitted', 'approved', 'rejected'];

export default function ReportReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get(`/admin/reports/${id}`)
      .then(({ data }) => {
        setReport(data.report);
        setStatus(data.report.status);
        setFeedback(data.report.admin_feedback || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put(`/admin/reports/${id}/status`, {
        status,
        admin_feedback: feedback,
      });
      setReport(data.report);
      setMessage('Status laporan berhasil diperbarui.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setSaving(false);
    }
  }

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-ink/40 text-sm">Memuat...</p>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <p className="text-ink/40 text-sm">Laporan tidak ditemukan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link to="/admin/reports" className="text-sm text-ink/40 hover:underline mb-3 inline-block">
        ← Kembali ke daftar
      </Link>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display font-bold text-2xl">{report.user_name}</h1>
        <StatusBadge status={report.status} />
      </div>
      <p className="text-ink/50 mb-8">
        {report.user_email} · {new Date(report.report_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-display font-semibold mb-3">Deskripsi Kegiatan</h2>
          <p className="text-sm text-ink/70 whitespace-pre-line mb-6">{report.description}</p>

          {report.files?.length > 0 && (
            <>
              <h3 className="font-display font-semibold text-sm mb-2">Lampiran</h3>
              <ul className="space-y-1.5">
                {report.files.map((path) => (
                  <li key={path}>
                    <a href={`${apiBase}/uploads/${path}`} target="_blank" rel="noreferrer" className="text-sm text-signal hover:underline">
                      {path.split('/').pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-display font-semibold mb-4">Verifikasi</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && <p className="text-sm bg-paper rounded-lg px-3 py-2">{message}</p>}
            <div>
              <label className="field-label">Status</label>
              <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Catatan / Feedback</label>
              <textarea
                rows={4}
                className="field-input"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Opsional"
              />
            </div>
            <button type="submit" disabled={saving} className="btn btn-signal w-full">
              {saving ? 'Menyimpan...' : 'Simpan Verifikasi'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
