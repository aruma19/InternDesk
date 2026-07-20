import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import UserLayout from '../../components/UserLayout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [internForm, setInternForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/intern-forms/me')
      .then(({ data }) => setInternForm(data.internForm))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserLayout>
      <h1 className="font-display font-bold text-2xl mb-1">Halo, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="text-ink/50 mb-8">Berikut ringkasan status magang kamu.</p>

      {loading ? (
        <p className="text-ink/40 text-sm">Memuat...</p>
      ) : !internForm ? (
        <div className="card p-8 text-center">
          <p className="font-display font-semibold text-lg mb-2">Belum ada form magang</p>
          <p className="text-ink/50 text-sm mb-5 max-w-sm mx-auto">
            Lengkapi form pengajuan magang untuk mulai proses administrasi di BID TIK.
          </p>
          <Link to="/form" className="btn btn-signal">
            Isi Form Magang
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-ink/50 mb-1">Status Magang</p>
              <StatusBadge status={internForm.status_magang} />
            </div>
            {internForm.status_magang === 'aktif' && (
              <Link to="/reports" className="btn btn-signal">
                Buka Laporan Magang
              </Link>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display font-semibold mb-4">Data Diri</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <Field label="Nama" value={internForm.nama} />
              <Field label="Instansi Pendidikan" value={internForm.instansi_pendidikan} />
              <Field label="Program Studi" value={internForm.prodi_jurusan} />
              <Field label="Semester / Kelas" value={internForm.semester_kelas} />
              <Field label="No. HP" value={internForm.no_hp} />
              <Field label="Instagram" value={internForm.instagram || '-'} />
              <Field label="Tanggal Masuk" value={internForm.tanggal_masuk} />
              <Field label="Tanggal Keluar" value={internForm.tanggal_keluar} />
              <Field label="Judul Projek" value={internForm.judul_projek || '-'} />
              <Field
                label="Link Drive"
                value={
                  internForm.link_drive ? (
                    <a href={internForm.link_drive} target="_blank" rel="noreferrer" className="text-signal hover:underline">
                      Buka tautan
                    </a>
                  ) : (
                    '-'
                  )
                }
              />
            </dl>
          </div>
        </div>
      )}
    </UserLayout>
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
