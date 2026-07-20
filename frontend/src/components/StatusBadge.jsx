const LABELS = {
  pengajuan: 'Pengajuan',
  aktif: 'Aktif',
  alumni: 'Alumni',
  draft: 'Draft',
  submitted: 'Menunggu Verifikasi',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}
