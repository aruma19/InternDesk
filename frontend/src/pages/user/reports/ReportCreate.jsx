import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import UserLayout from '../../../components/UserLayout.jsx';

export default function ReportCreate() {
  const [description, setDescription] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('description', description);
      payload.append('report_date', reportDate);
      files.forEach((f) => payload.append('files', f));

      await api.post('/reports', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan laporan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <UserLayout>
      <h1 className="font-display font-bold text-2xl mb-1">Buat Laporan Magang</h1>
      <p className="text-ink/50 mb-8">Ceritakan aktivitas magangmu hari ini.</p>

      <form onSubmit={handleSubmit} className="card p-7 space-y-5 max-w-2xl">
        {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="field-label">Tanggal Laporan</label>
          <input
            type="date"
            required
            className="field-input"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Deskripsi Kegiatan</label>
          <textarea
            required
            rows={6}
            className="field-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan aktivitas yang kamu kerjakan..."
          />
        </div>

        <div>
          <label className="field-label">Lampiran (opsional, bisa lebih dari satu)</label>
          <input
            type="file"
            multiple
            className="field-input file:mr-3 file:rounded-md file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-xs file:font-medium"
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-signal w-full">
          {loading ? 'Menyimpan...' : 'Kirim Laporan'}
        </button>
      </form>
    </UserLayout>
  );
}
