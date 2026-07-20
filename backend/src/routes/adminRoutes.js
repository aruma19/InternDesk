const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const internFormController = require('../controllers/internFormController');
const reportController = require('../controllers/reportController');

router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Manajemen user
router.post('/users', adminController.createUser);

// Manajemen form magang
router.get('/intern-forms/stats', internFormController.adminStats);
router.get('/intern-forms/:id', internFormController.adminGetOne);
router.get('/intern-forms', internFormController.adminList);
router.put('/intern-forms/:id', internFormController.adminUpdateStatus);

// Manajemen laporan magang
router.get('/reports/students', reportController.adminStudents);
router.get('/reports/:id', reportController.adminShow);
router.get('/reports', reportController.adminIndex);
router.put('/reports/:id/status', reportController.adminUpdateStatus);

module.exports = router;
