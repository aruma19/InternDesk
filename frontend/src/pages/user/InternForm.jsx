import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import UserLayout from '../../components/UserLayout.jsx';

const initialState = {
  nama: '',
  instansi_pendidikan: '',
  semester_kelas: '',
  prodi_jurusan: '',
  agama: '',
  tanggal_masuk: '',
  tanggal_keluar: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  lama_magang: '',
  no_hp: '',
  instagram: '',
  jenis_kelamin: 'L',
  status_magang: 'pengajuan',
  judul_projek: '',
  link_drive: '',
};

export default function InternForm() {
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/intern-forms/me')
      .then(({ data }) => {
        if (data.internForm) {
          navigate('/dashboard');
        }
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (file) payload.append('file_permohonan', file);

      await api.post('/intern-forms', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <UserLayout>
        <p className="text-ink/40 text-sm">Memuat...</p>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <h1 className="font-display font-bold text-2xl mb-1">Form Pengajuan Magang</h1>
      <p className="text-ink/50 mb-8">Isi data berikut dengan lengkap dan benar.</p>

      <form onSubmit={handleSubmit} className="card p-7 space-y-6 max-w-3xl">
        {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}

        <Section title="Data Diri">
          <Row>
            <Field label="Nama Lengkap">
              <input required className="field-input" value={form.nama} onChange={(e) => update('nama', e.target.value)} />
            </Field>
            <Field label="Jenis Kelamin">
              <select className="field-input" value={form.jenis_kelamin} onChange={(e) => update('jenis_kelamin', e.target.value)}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Tempat Lahir">
              <input required className="field-input" value={form.tempat_lahir} onChange={(e) => update('tempat_lahir', e.target.value)} />
            </Field>
            <Field label="Tanggal Lahir">
              <input type="date" required className="field-input" value={form.tanggal_lahir} onChange={(e) => update('tanggal_lahir', e.target.value)} />
            </Field>
          </Row>
          <Row>
            <Field label="Agama">
              <input required className="field-input" value={form.agama} onChange={(e) => update('agama', e.target.value)} />
            </Field>
            <Field label="No. HP">
              <input required className="field-input" value={form.no_hp} onChange={(e) => update('no_hp', e.target.value)} />
            </Field>
          </Row>
          <Field label="Instagram (opsional)">
            <input className="field-input" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="@username" />
          </Field>
        </Section>

        <Section title="Data Akademik">
          <Row>
            <Field label="Instansi Pendidikan">
              <input required className="field-input" value={form.instansi_pendidikan} onChange={(e) => update('instansi_pendidikan', e.target.value)} />
            </Field>
            <Field label="Program Studi / Jurusan">
              <input required className="field-input" value={form.prodi_jurusan} onChange={(e) => update('prodi_jurusan', e.target.value)} />
            </Field>
          </Row>
          <Field label="Semester / Kelas">
            <input required className="field-input" value={form.semester_kelas} onChange={(e) => update('semester_kelas', e.target.value)} />
          </Field>
        </Section>

        <Section title="Data Magang">
          <Row>
            <Field label="Tanggal Masuk">
              <input type="date" required className="field-input" value={form.tanggal_masuk} onChange={(e) => update('tanggal_masuk', e.target.value)} />
            </Field>
            <Field label="Tanggal Keluar">
              <input type="date" required className="field-input" value={form.tanggal_keluar} onChange={(e) => update('tanggal_keluar', e.target.value)} />
            </Field>
          </Row>
          <Row>
            <Field label="Lama Magang (bulan)">
              <input type="number" min="1" required className="field-input" value={form.lama_magang} onChange={(e) => update('lama_magang', e.target.value)} />
            </Field>
            <Field label="Status Magang">
              <select className="field-input" value={form.status_magang} onChange={(e) => update('status_magang', e.target.value)}>
                <option value="pengajuan">Pengajuan</option>
                <option value="aktif">Aktif</option>
                <option value="alumni">Alumni</option>
              </select>
            </Field>
          </Row>

          {form.status_magang === 'pengajuan' ? (
            <Field label="Surat Permohonan (PDF)">
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx"
                className="field-input file:mr-3 file:rounded-md file:border-0 file:bg-ink file:text-paper file:px-3 file:py-1.5 file:text-xs file:font-medium"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Field>
          ) : (
            <>
              <Field label="Judul Projek">
                <input required className="field-input" value={form.judul_projek} onChange={(e) => update('judul_projek', e.target.value)} />
              </Field>
              <Field label="Link Drive (opsional)">
                <input className="field-input" value={form.link_drive} onChange={(e) => update('link_drive', e.target.value)} placeholder="https://drive.google.com/..." />
              </Field>
            </>
          )}
        </Section>

        <button type="submit" disabled={loading} className="btn btn-signal w-full">
          {loading ? 'Menyimpan...' : 'Simpan Form Magang'}
        </button>
      </form>
    </UserLayout>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-ink/40 mb-3">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}
