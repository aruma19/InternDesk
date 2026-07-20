import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
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
      const { data } = await api.post('/auth/admin/login', { username, password });
      loginSuccess(data.token, data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ink">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display font-extrabold text-2xl text-paper tracking-tight">BID TIK</p>
          <p className="text-sm text-paper/50 mt-1">Panel Administrator</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <h1 className="font-display font-bold text-lg mb-1">Login Admin</h1>
          {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="field-label">Username / Email</label>
            <input
              required
              className="field-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
          <p className="text-center text-xs text-ink/30">
            <Link to="/login" className="hover:underline">
              Login sebagai mahasiswa
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
