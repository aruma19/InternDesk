import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      loginSuccess(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display font-extrabold text-2xl text-ink tracking-tight">BID TIK</p>
          <p className="text-sm text-ink/50 mt-1">Sistem Pendataan Mahasiswa Magang</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <h1 className="font-display font-bold text-lg mb-1">Buat Akun Baru</h1>
          {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="field-label">Nama Lengkap</label>
            <input
              required
              className="field-input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              required
              className="field-input"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="field-input"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-signal w-full">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
          <p className="text-center text-sm text-ink/50">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-ink font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
