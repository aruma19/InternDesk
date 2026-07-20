import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/axios';
import UserLayout from '../../../components/UserLayout.jsx';

export default function ReportEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api
      .get(`/reports/${id}`)
      .then(({ data }) => {
        const r = data.report;
        setDescription(r.description);
        setReportDate(r.report_date);
        setExistingFiles(r.files || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat laporan.'))
      .finally(() => setFetching(false));
  }, [id]);

  function removeExisting(path) {
    setExistingFiles((prev) => prev.filter((f) => f !== path));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('description', description);
      payload.append('report_date', reportDate);
      payload.append('existing_files', JSON.stringify(existingFiles));
      newFiles.forEach((f) => payload.append('files', f));

      await api.put(`/reports/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui laporan.');
    } finally {
      setLoading(false);
    }
  }

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

  if (fetching) {
    return (
      <UserLayout>
        <p className="text-ink/40 text-sm">Memuat...</p>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <h1 className="font-display font-bold text-2xl mb-1">Edit Laporan Magang</h1>
      <p className="text-ink/50 mb-8">Perbarui detail laporanmu.</p>

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
          />
        </div>

        {existingFiles.length > 0 && (
          <div>
            <label className="field-label">Lampiran Saat Ini</label>
            <ul className="space-y-1.5">
              {existingFiles.map((path) => (
                <li key={path} className="flex items-center justify-between text-sm bg-paper rounded-lg px-3 py-2">
                  <a href={`${apiBase}/uploads/${path}`} target="_blank" rel="noreferrer" className="text-signal hover:underline truncate">
                    {path.split('/').pop()}
                  </a>
                  <button type="button" onClick={() => removeExisting(path)} className="text-clay text-xs font-medium ml-3 shrink-0">
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="field-label">Tambah Lampiran Baru (opsional)</label>
          <input
            type="file"
            multiple
            className="field-input file:mr-3 file:rounded-md file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-xs file:font-medium"
            onChange={(e) => setNewFiles(Array.from(e.target.files))}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-signal w-full">
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </UserLayout>
  );
}
