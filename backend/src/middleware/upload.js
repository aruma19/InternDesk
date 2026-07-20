const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function randomName(originalname) {
  const ext = path.extname(originalname);
  return crypto.randomBytes(20).toString('hex') + ext;
}

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

// Storage untuk file permohonan (form pengajuan magang)
const permohonanStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, 'permohonan');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, randomName(file.originalname)),
});

// Lampiran laporan magang disimpan dulu di memory, lalu ditulis ke disk
// oleh controller setelah intern_form_id milik user diketahui (lihat
// controllers/reportController.js -> saveReportFilesToDisk)
const uploadPermohonan = multer({
  storage: permohonanStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadReportFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

function saveReportFilesToDisk(internFormId, files = []) {
  const dir = path.join(UPLOAD_ROOT, 'internship_reports', String(internFormId));
  ensureDir(dir);
  return files.map((file) => {
    const filename = randomName(file.originalname);
    fs.writeFileSync(path.join(dir, filename), file.buffer);
    return `internship_reports/${internFormId}/${filename}`;
  });
}

module.exports = { uploadPermohonan, uploadReportFiles, saveReportFilesToDisk, UPLOAD_ROOT };
