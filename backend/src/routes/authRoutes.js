const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { register, login, adminLogin, me } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', authenticate, me);

module.exports = router;
