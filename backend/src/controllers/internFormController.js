const pool = require('../config/db');

const STATUS_VALUES = ['pengajuan', 'aktif', 'alumni'];
const GENDER_VALUES = ['L', 'P'];

// GET /api/intern-forms/me
async function getMyForm(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM intern_forms WHERE user_id = ? LIMIT 1', [
      req.user.id,
    ]);
    return res.json({ internForm: rows[0] || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// POST /api/intern-forms   (mahasiswa mengisi form magang, sekali saja)
async function createForm(req, res) {
  try {
    const [existingRows] = await pool.query('SELECT id FROM intern_forms WHERE user_id = ?', [
      req.user.id,
    ]);
    if (existingRows.length > 0) {
      return res.status(422).json({ message: 'Anda sudah pernah mengisi form magang.' });
    }

    const {
      nama,
      instansi_pendidikan,
      semester_kelas,
      prodi_jurusan,
      agama,
      tanggal_masuk,
      tanggal_keluar,
      tempat_lahir,
      tanggal_lahir,
      lama_magang,
      no_hp,
      instagram,
      jenis_kelamin,
      status_magang,
      judul_projek,
      link_drive,
    } = req.body;

    const requiredFields = {
      nama,
      instansi_pendidikan,
      semester_kelas,
      prodi_jurusan,
      agama,
      tanggal_masuk,
      tanggal_keluar,
      tempat_lahir,
      tanggal_lahir,
      lama_magang,
      no_hp,
      jenis_kelamin,
      status_magang,
    };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === '') {
        return res.status(422).json({ message: `Field "${key}" wajib diisi.` });
      }
    }
    if (!STATUS_VALUES.includes(status_magang)) {
      return res.status(422).json({ message: 'status_magang tidak valid.' });
    }
    if (!GENDER_VALUES.includes(jenis_kelamin)) {
      return res.status(422).json({ message: 'jenis_kelamin tidak valid.' });
    }
    if (status_magang === 'pengajuan' && !req.file) {
      return res.status(422).json({ message: 'File permohonan wajib diunggah untuk status pengajuan.' });
    }
    if (status_magang !== 'pengajuan' && !judul_projek) {
      return res.status(422).json({ message: 'Judul projek wajib diisi.' });
    }

    const filePermohonan = req.file ? `permohonan/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO intern_forms
        (user_id, nama, instansi_pendidikan, semester_kelas, prodi_jurusan, agama,
         tanggal_masuk, tanggal_keluar, tempat_lahir, tanggal_lahir, lama_magang,
         no_hp, instagram, jenis_kelamin, status_magang, file_permohonan, judul_projek, link_drive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        nama,
        instansi_pendidikan,
        semester_kelas,
        prodi_jurusan,
        agama,
        tanggal_masuk,
        tanggal_keluar,
        tempat_lahir,
        tanggal_lahir,
        lama_magang,
        no_hp,
        instagram || null,
        jenis_kelamin,
        status_magang,
        filePermohonan,
        judul_projek || null,
        link_drive || null,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM intern_forms WHERE id = ?', [result.insertId]);
    return res.status(201).json({ internForm: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// GET /api/admin/intern-forms?status=&search=&page=&limit=
async function adminList(req, res) {
  try {
    const { status, search } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 100);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (status && STATUS_VALUES.includes(status)) {
      where.push('f.status_magang = ?');
      params.push(status);
    }
    if (search) {
      where.push('(f.nama LIKE ? OR f.instansi_pendidikan LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM intern_forms f JOIN users u ON u.id = f.user_id ${whereSql}`,
      params
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT f.*, u.name as user_name, u.email as user_email
       FROM intern_forms f
       JOIN users u ON u.id = f.user_id
       ${whereSql}
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// GET /api/admin/intern-forms/stats
async function adminStats(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT status_magang, COUNT(*) as total FROM intern_forms GROUP BY status_magang`
    );
    const stats = { pengajuan: 0, aktif: 0, alumni: 0 };
    rows.forEach((r) => {
      stats[r.status_magang] = r.total;
    });
    return res.json({ stats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// GET /api/admin/intern-forms/:id
async function adminGetOne(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, u.name as user_name, u.email as user_email
       FROM intern_forms f JOIN users u ON u.id = f.user_id
       WHERE f.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Data tidak ditemukan.' });
    return res.json({ internForm: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// PUT /api/admin/intern-forms/:id   (admin memperbarui status_magang)
async function adminUpdateStatus(req, res) {
  try {
    const { status_magang } = req.body;
    if (!STATUS_VALUES.includes(status_magang)) {
      return res.status(422).json({ message: 'status_magang tidak valid.' });
    }
    const [rows] = await pool.query('SELECT id FROM intern_forms WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Data tidak ditemukan.' });

    await pool.query('UPDATE intern_forms SET status_magang = ? WHERE id = ?', [
      status_magang,
      req.params.id,
    ]);

    const [updated] = await pool.query('SELECT * FROM intern_forms WHERE id = ?', [req.params.id]);
    return res.json({ internForm: updated[0], message: 'Status magang berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

module.exports = { getMyForm, createForm, adminList, adminStats, adminGetOne, adminUpdateStatus };
