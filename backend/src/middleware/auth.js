const jwt = require('jsonwebtoken');

/**
 * Memverifikasi JWT dari header Authorization: Bearer <token>
 * dan menempelkan payload user ke req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login kembali.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, name, email, is_admin }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
}

/**
 * Harus dipanggil setelah authenticate(). Menolak akses jika bukan admin.
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Anda tidak memiliki akses admin.' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
