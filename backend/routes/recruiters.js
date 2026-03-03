// routes/recruiters.js
const express = require('express');
const { getProfile } = require('../controllers/recruiterController');
const { auth, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.use(authorizeRole('recruiter'));

router.get('/profile', getProfile);

module.exports = router;
