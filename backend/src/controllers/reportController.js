const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { saveReportFilesToDisk, UPLOAD_ROOT } = require('../middleware/upload');

const STATUS_VALUES = ['draft', 'submitted', 'approved', 'rejected'];

async function getActiveInternForm(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM intern_forms WHERE user_id = ? AND status_magang = 'aktif' LIMIT 1",
    [userId]
  );
  return rows[0] || null;
}

function parseFiles(row) {
  if (!row) return row;
  if (typeof row.files === 'string') {
    try {
      row.files = JSON.parse(row.files);
    } catch {
      row.files = [];
    }
  }
  return row;
}

// GET /api/reports  (laporan milik mahasiswa yang sedang login)
async function index(req, res) {
  try {
    const internForm = await getActiveInternForm(req.user.id);
    if (!internForm) {
      return res.status(403).json({ message: 'Anda tidak memiliki internship aktif.' });
    }
    const [rows] = await pool.query(
      'SELECT * FROM internship_reports WHERE intern_form_id = ? ORDER BY report_date DESC',
      [internForm.id]
    );
    return res.json({ reports: rows.map(parseFiles) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// POST /api/reports
async function store(req, res) {
  try {
    const internForm = await getActiveInternForm(req.user.id);
    if (!internForm) {
      return res.status(403).json({ message: 'Anda tidak memiliki internship aktif.' });
    }
    const { description, report_date } = req.body;
    if (!description || !report_date) {
      return res.status(422).json({ message: 'Deskripsi dan tanggal laporan wajib diisi.' });
    }

    const files = saveReportFilesToDisk(internForm.id, req.files || []);

    const [result] = await pool.query(
      `INSERT INTO internship_reports (intern_form_id, description, report_date, files, status)
       VALUES (?, ?, ?, ?, 'submitted')`,
      [internForm.id, description, report_date, JSON.stringify(files)]
    );

    const [rows] = await pool.query('SELECT * FROM internship_reports WHERE id = ?', [
      result.insertId,
    ]);
    return res.status(201).json({ report: parseFiles(rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

async function findOwnedReport(req) {
  const internForm = await getActiveInternForm(req.user.id);
  if (!internForm) return { error: 'Anda tidak memiliki internship aktif.', status: 403 };

  const [rows] = await pool.query('SELECT * FROM internship_reports WHERE id = ?', [
    req.params.id,
  ]);
  const report = rows[0];
  if (!report) return { error: 'Laporan tidak ditemukan.', status: 404 };
  if (report.intern_form_id !== internForm.id) {
    return { error: 'Anda tidak memiliki izin untuk mengakses laporan ini.', status: 403 };
  }
  return { report, internForm };
}

// GET /api/reports/:id
async function show(req, res) {
  try {
    const { error, status, report } = await findOwnedReport(req);
    if (error) return res.status(status).json({ message: error });
    return res.json({ report: parseFiles(report) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// PUT /api/reports/:id
async function update(req, res) {
  try {
    const { error, status, report, internForm } = await findOwnedReport(req);
    if (error) return res.status(status).json({ message: error });

    const { description, report_date } = req.body;
    if (!description || !report_date) {
      return res.status(422).json({ message: 'Deskripsi dan tanggal laporan wajib diisi.' });
    }

    let existingFiles = [];
    if (req.body.existing_files) {
      try {
        existingFiles = Array.isArray(req.body.existing_files)
          ? req.body.existing_files
          : JSON.parse(req.body.existing_files);
      } catch {
        existingFiles = [];
      }
    }

    const newFiles = saveReportFilesToDisk(internForm.id, req.files || []);
    const allFiles = [...existingFiles, ...newFiles];

    await pool.query(
      `UPDATE internship_reports
       SET description = ?, report_date = ?, files = ?, status = 'submitted'
       WHERE id = ?`,
      [description, report_date, JSON.stringify(allFiles), report.id]
    );

    const [rows] = await pool.query('SELECT * FROM internship_reports WHERE id = ?', [report.id]);
    return res.json({ report: parseFiles(rows[0]), message: 'Laporan magang berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// DELETE /api/reports/:id
async function destroy(req, res) {
  try {
    const { error, status, report } = await findOwnedReport(req);
    if (error) return res.status(status).json({ message: error });

    const files = typeof report.files === 'string' ? JSON.parse(report.files || '[]') : report.files || [];
    files.forEach((relPath) => {
      const abs = path.join(UPLOAD_ROOT, relPath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    });

    await pool.query('DELETE FROM internship_reports WHERE id = ?', [report.id]);
    return res.json({ message: 'Laporan magang berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// ---- ADMIN ----

// GET /api/admin/reports?student_id=&status=&search=&page=&limit=
async function adminIndex(req, res) {
  try {
    const { student_id, status, search } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 100);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (student_id) {
      where.push('f.user_id = ?');
      params.push(student_id);
    }
    if (status && STATUS_VALUES.includes(status)) {
      where.push('r.status = ?');
      params.push(status);
    }
    if (search) {
      where.push('(r.description LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const baseFrom = `
      FROM internship_reports r
      JOIN intern_forms f ON f.id = r.intern_form_id
      JOIN users u ON u.id = f.user_id
      ${whereSql}
    `;

    const [countRows] = await pool.query(`SELECT COUNT(*) as total ${baseFrom}`, params);
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT r.*, f.nama as intern_nama, u.id as user_id, u.name as user_name, u.email as user_email
       ${baseFrom}
       ORDER BY r.report_date DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      data: rows.map(parseFiles),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// GET /api/admin/reports/students   (daftar mahasiswa non-admin untuk filter)
async function adminStudents(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE is_admin = 0 ORDER BY name ASC'
    );
    return res.json({ students: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// GET /api/admin/reports/:id
async function adminShow(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, f.nama as intern_nama, f.id as intern_form_id, u.name as user_name, u.email as user_email
       FROM internship_reports r
       JOIN intern_forms f ON f.id = r.intern_form_id
       JOIN users u ON u.id = f.user_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });
    return res.json({ report: parseFiles(rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

// PUT /api/admin/reports/:id/status
async function adminUpdateStatus(req, res) {
  try {
    const { status, admin_feedback } = req.body;
    if (!STATUS_VALUES.includes(status)) {
      return res.status(422).json({ message: 'Status tidak valid.' });
    }
    const [rows] = await pool.query('SELECT id FROM internship_reports WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Laporan tidak ditemukan.' });

    await pool.query('UPDATE internship_reports SET status = ?, admin_feedback = ? WHERE id = ?', [
      status,
      admin_feedback || null,
      req.params.id,
    ]);

    const [updated] = await pool.query('SELECT * FROM internship_reports WHERE id = ?', [
      req.params.id,
    ]);
    return res.json({ report: parseFiles(updated[0]), message: 'Status laporan berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
}

module.exports = {
  index,
  store,
  show,
  update,
  destroy,
  adminIndex,
  adminStudents,
  adminShow,
  adminUpdateStatus,
};
