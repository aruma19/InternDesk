import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUS_TABS = [
  { value: '', label: 'Semua' },
  { value: 'pengajuan', label: 'Pengajuan' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'alumni', label: 'Alumni' },
];

export default function InternForms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/intern-forms', { params: { status, search, page, limit: 15 } })
      .then(({ data: res }) => {
        setData(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [status, search, page]);

  function updateParams(next) {
    const merged = { status, search, page, ...next };
    const params = {};
    if (merged.status) params.status = merged.status;
    if (merged.search) params.search = merged.search;
    if (merged.page && merged.page !== 1) params.page = merged.page;
    setSearchParams(params);
  }

  return (
    <AdminLayout>
      <h1 className="font-display font-bold text-2xl mb-1">Data Mahasiswa Magang</h1>
      <p className="text-ink/50 mb-6">Kelola pengajuan, status aktif, dan alumni magang.</p>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-1 bg-white border border-line rounded-lg p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => updateParams({ status: t.value, page: 1 })}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                status === t.value ? 'bg-ink text-paper' : 'text-ink/60 hover:bg-paper'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ search: searchInput, page: 1 });
          }}
          className="flex gap-2"
        >
          <input
            className="field-input !py-2 w-56"
            placeholder="Cari nama, instansi, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost !py-2">
            Cari
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-ink/40 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3">Nama</th>
              <th className="text-left px-5 py-3">Instansi</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                  Memuat...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <tr key={f.id}>
                  <td className="px-5 py-3.5 font-medium">{f.nama}</td>
                  <td className="px-5 py-3.5 text-ink/60">{f.instansi_pendidikan}</td>
                  <td className="px-5 py-3.5 text-ink/60">{f.user_email}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={f.status_magang} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/admin/intern-forms/${f.id}`} className="btn btn-ghost text-xs !px-3 !py-1.5">
                      Kelola
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParams({ page: p })}
              className={`w-8 h-8 rounded-md text-sm font-medium ${
                p === page ? 'bg-ink text-paper' : 'bg-white border border-line text-ink/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
