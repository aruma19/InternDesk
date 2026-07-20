import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUS_OPTIONS = ['pengajuan', 'aktif', 'alumni'];

export default function EditInternForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get(`/admin/intern-forms/${id}`)
      .then(({ data }) => {
        setForm(data.internForm);
        setStatus(data.internForm.status_magang);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdateStatus(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await api.put(`/admin/intern-forms/${id}`, { status_magang: status });
      setForm(data.internForm);
      setMessage('Status berhasil diperbarui.');
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

  if (!form) {
    return (
      <AdminLayout>
        <p className="text-ink/40 text-sm">Data tidak ditemukan.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link to="/admin/intern-forms" className="text-sm text-ink/40 hover:underline mb-3 inline-block">
        ← Kembali ke daftar
      </Link>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display font-bold text-2xl">{form.nama}</h1>
        <StatusBadge status={form.status_magang} />
      </div>
      <p className="text-ink/50 mb-8">{form.user_email}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-display font-semibold mb-4">Data Diri & Magang</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <Field label="Instansi Pendidikan" value={form.instansi_pendidikan} />
            <Field label="Program Studi" value={form.prodi_jurusan} />
            <Field label="Semester / Kelas" value={form.semester_kelas} />
            <Field label="Agama" value={form.agama} />
            <Field label="Tempat, Tanggal Lahir" value={`${form.tempat_lahir}, ${form.tanggal_lahir}`} />
            <Field label="Jenis Kelamin" value={form.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
            <Field label="No. HP" value={form.no_hp} />
            <Field label="Instagram" value={form.instagram || '-'} />
            <Field label="Tanggal Masuk" value={form.tanggal_masuk} />
            <Field label="Tanggal Keluar" value={form.tanggal_keluar} />
            <Field label="Lama Magang" value={`${form.lama_magang} bulan`} />
            <Field label="Judul Projek" value={form.judul_projek || '-'} />
            <Field
              label="Link Drive"
              value={
                form.link_drive ? (
                  <a href={form.link_drive} target="_blank" rel="noreferrer" className="text-signal hover:underline">
                    Buka tautan
                  </a>
                ) : (
                  '-'
                )
              }
            />
            <Field
              label="File Permohonan"
              value={
                form.file_permohonan ? (
                  <a href={`${apiBase}/uploads/${form.file_permohonan}`} target="_blank" rel="noreferrer" className="text-signal hover:underline">
                    Lihat berkas
                  </a>
                ) : (
                  '-'
                )
              }
            />
          </dl>
        </div>

        <div className="card p-6 h-fit">
          <h2 className="font-display font-semibold mb-4">Ubah Status Magang</h2>
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            {message && <p className="text-sm bg-paper rounded-lg px-3 py-2">{message}</p>}
            <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button type="submit" disabled={saving} className="btn btn-signal w-full">
              {saving ? 'Menyimpan...' : 'Simpan Status'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-ink/40 text-xs uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
