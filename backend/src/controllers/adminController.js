const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/admin/dashboard
async function dashboard(req, res) {
  try {
    const [statusRows] = await pool.query(
      'SELECT status_magang, COUNT(*) as total FROM intern_forms GROUP BY status_magang'
    );
    const counts = { pengajuan: 0, aktif: 0, alumni: 0 };
    statusRows.forEach((r) => (counts[r.status_magang] = r.total));

    const [[{ totalUsers }]] = await pool.query(
      'SELECT COUNT(*) as totalUsers FROM users WHERE is_admin = 0'
    );
    const [[{ totalReports }]] = await pool.query(
      'SELECT COUNT(*) as totalReports FROM internship_reports'
    );
    const [[{ pendingReports }]] = await pool.query(
      "SELECT COUNT(*) as pendingReports FROM internship_reports WHERE status = 'submitted'"
    );

    return res.json({
      pengajuanCount: counts.pengajuan,
      aktifCount: counts.aktif,
      alumniCount: counts.alumni,
      totalUsers,
      totalReports,
      pendingReports,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// POST /api/admin/users  (admin membuat user baru, termasuk admin lain)
async function createUser(req, res) {
  try {
    const { name, email, password, password_confirmation, is_admin } = req.body;

    if (!name || !email || !password) {
      return res.status(422).json({ message: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(422).json({ message: 'Password minimal 6 karakter.' });
    }
    if (password_confirmation !== undefined && password !== password_confirmation) {
      return res.status(422).json({ message: 'Konfirmasi password tidak cocok.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(422).json({ message: 'Email sudah digunakan.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [name, email, hashed, is_admin ? 1 : 0]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, is_admin, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({ user: rows[0], message: 'User berhasil dibuat.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

module.exports = { dashboard, createUser };
