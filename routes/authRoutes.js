const express = require('express');
const router = express.Router();
const { syncUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Route to sync user (create or get) after frontend Firebase login
router.post('/sync', syncUser);

// Route to get current user details from Mongo
router.get('/me', protect, getMe);

module.exports = router;
