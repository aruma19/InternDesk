const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadReportFiles } = require('../middleware/upload');
const { index, store, show, update, destroy } = require('../controllers/reportController');

router.get('/', authenticate, index);
router.post('/', authenticate, uploadReportFiles.array('files', 10), store);
router.get('/:id', authenticate, show);
router.put('/:id', authenticate, uploadReportFiles.array('files', 10), update);
router.delete('/:id', authenticate, destroy);

module.exports = router;
