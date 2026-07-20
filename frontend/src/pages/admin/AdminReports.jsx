import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function AdminReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = searchParams.get('student_id') || '';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);
  const [students, setStudents] = useState([]);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports/students').then(({ data }) => setStudents(data.students));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/admin/reports', { params: { student_id: studentId, status, search, page, limit: 15 } })
      .then(({ data: res }) => {
        setData(res.data);
        setPagination(res.pagination);
      })
      .finally(() => setLoading(false));
  }, [studentId, status, search, page]);

  function updateParams(next) {
    const merged = { student_id: studentId, status, search, page, ...next };
    const params = {};
    if (merged.student_id) params.student_id = merged.student_id;
    if (merged.status) params.status = merged.status;
    if (merged.search) params.search = merged.search;
    if (merged.page && merged.page !== 1) params.page = merged.page;
    setSearchParams(params);
  }

  return (
    <AdminLayout>
      <h1 className="font-display font-bold text-2xl mb-1">Laporan Magang</h1>
      <p className="text-ink/50 mb-6">Tinjau dan verifikasi laporan mahasiswa magang.</p>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-5">
        <select
          className="field-input !py-2 w-full sm:w-56"
          value={studentId}
          onChange={(e) => updateParams({ student_id: e.target.value, page: 1 })}
        >
          <option value="">Semua Mahasiswa</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="field-input !py-2 w-full sm:w-44"
          value={status}
          onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Menunggu Verifikasi</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ search: searchInput, page: 1 });
          }}
          className="flex gap-2 sm:flex-1 sm:min-w-[14rem]"
        >
          <input
            className="field-input !py-2 flex-1"
            placeholder="Cari deskripsi, nama, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost !py-2 shrink-0">
            Cari
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-ink/40 text-sm">Memuat...</p>
        ) : data.length === 0 ? (
          <div className="card p-8 text-center text-ink/40">Tidak ada laporan.</div>
        ) : (
          data.map((r) => (
            <div key={r.id} className="card p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="font-semibold">{r.user_name}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-ink/40 mb-1.5">
                  {new Date(r.report_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · {r.user_email}
                </p>
                <p className="text-sm text-ink/60 line-clamp-2 max-w-2xl">{r.description}</p>
              </div>
              <Link to={`/admin/reports/${r.id}`} className="btn btn-ghost text-xs !px-3 !py-1.5 shrink-0">
                Tinjau
              </Link>
            </div>
          ))
        )}
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
