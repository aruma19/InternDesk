import { useState } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout.jsx';

export default function CreateUser() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', is_admin: false });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/admin/users', form);
      setMessage('User berhasil dibuat.');
      setForm({ name: '', email: '', password: '', password_confirmation: '', is_admin: false });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat user.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-md mx-auto text-center">
        <h1 className="font-display font-bold text-2xl mb-1">Tambah User</h1>
        <p className="text-ink/50 mb-8">Buat akun mahasiswa atau admin baru secara manual.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-7 space-y-4 max-w-md mx-auto text-left">
        {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
        {message && <p className="text-sm text-moss bg-moss/10 rounded-lg px-3 py-2">{message}</p>}

        <div>
          <label className="field-label">Nama Lengkap</label>
          <input required className="field-input" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input type="email" required className="field-input" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input type="password" required minLength={6} className="field-input" value={form.password} onChange={(e) => update('password', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Konfirmasi Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="field-input"
            value={form.password_confirmation}
            onChange={(e) => update('password_confirmation', e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.is_admin} onChange={(e) => update('is_admin', e.target.checked)} />
          Jadikan sebagai admin
        </label>

        <button type="submit" disabled={loading} className="btn btn-signal w-full">
          {loading ? 'Menyimpan...' : 'Buat User'}
        </button>
      </form>
    </AdminLayout>
  );
}
