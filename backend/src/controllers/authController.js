const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, is_admin: !!user.is_admin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// POST /api/auth/register  (pendaftaran akun mahasiswa baru)
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(422).json({ message: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(422).json({ message: 'Password minimal 6 karakter.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(422).json({ message: 'Email sudah terdaftar.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, 0)',
      [name, email, hashed]
    );

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];
    const token = signToken(user);

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// POST /api/auth/login  (login mahasiswa)
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ message: 'Email dan password wajib diisi.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const token = signToken(user);

    // Cek apakah mahasiswa punya form magang aktif -> beri tahu FE untuk redirect
    const [formRows] = await pool.query(
      'SELECT id, status_magang FROM intern_forms WHERE user_id = ? LIMIT 1',
      [user.id]
    );

    return res.json({
      token,
      user: sanitizeUser(user),
      internForm: formRows[0] || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// POST /api/auth/admin/login  (login admin)
async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(422).json({ message: 'Username dan password wajib diisi.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE (email = ? OR name = ?) AND is_admin = 1 LIMIT 1',
      [username, username]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Username atau password salah.' });
    }

    const token = signToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User tidak ditemukan.' });
    return res.json({ user: sanitizeUser(rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

module.exports = { register, login, adminLogin, me };
