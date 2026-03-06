// routes/students.js
const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile, parseResume } = require('../controllers/studentController');
const { auth, authorizeRole } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const multer = require('multer');

const router = express.Router();

// Memory storage for multer since we just pass buffer to pdf-parse and throw it away
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

router.use(auth);
router.use(authorizeRole('student'));

router.get('/profile', getProfile);

router.post('/resume/parse', upload.single('resume'), parseResume);

router.put('/profile', [
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('graduation_year').isInt({ min: 1900, max: 2100 }).withMessage('Valid graduation year required'),
    body('cgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
    body('skills').notEmpty().withMessage('Skills are required to compute matching score'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be non-negative integer in months'),
    body('resume_url').optional({ checkFalsy: true }).isURL().withMessage('Must be a valid URL'),
    validateRequest
], updateProfile);

module.exports = router;
