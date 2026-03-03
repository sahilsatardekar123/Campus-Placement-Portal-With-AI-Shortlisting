// routes/students.js
const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile } = require('../controllers/studentController');
const { auth, authorizeRole } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

const router = express.Router();

router.use(auth);
router.use(authorizeRole('student'));

router.get('/profile', getProfile);

router.put('/profile', [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('graduation_year').isInt({ min: 1900, max: 2100 }).withMessage('Valid graduation year required'),
    body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
    body('skills').notEmpty().withMessage('Skills are required to compute matching score'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be non-negative integer in months'),
    validateRequest
], updateProfile);

module.exports = router;
