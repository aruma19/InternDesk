import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      loginSuccess(data.token, data.user);
      if (data.internForm?.status_magang === 'aktif') {
        navigate('/reports');
      } else {
        navigate('/dashboard');
      }
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
          <h1 className="font-display font-bold text-lg mb-1">Masuk Akun</h1>
          {error && (
            <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              required
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              required
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-signal w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
          <p className="text-center text-sm text-ink/50">
            Belum punya akun?{' '}
            <Link to="/register" className="text-ink font-medium hover:underline">
              Daftar
            </Link>
          </p>
          <p className="text-center text-xs text-ink/30">
            <Link to="/admin/login" className="hover:underline">
              Login sebagai admin
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
