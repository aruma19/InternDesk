const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadPermohonan } = require('../middleware/upload');
const { getMyForm, createForm } = require('../controllers/internFormController');

router.get('/me', authenticate, getMyForm);
router.post('/', authenticate, uploadPermohonan.single('file_permohonan'), createForm);

module.exports = router;
