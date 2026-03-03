// routes/jobs.js
const express = require('express');
const { body } = require('express-validator');
const { createJob, getJobs, getRecruiterJobs } = require('../controllers/jobController');
const { auth, authorizeRole } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

const router = express.Router();

// Publicly accessible for students (with auth)
router.get('/', auth, getJobs);

// Recruiter specific
router.use(auth);
router.use(authorizeRole('recruiter'));

router.post('/', [
    body('title').notEmpty().withMessage('Job title is required'),
    body('skills_required').notEmpty().withMessage('Required skills are mandatory for AI shortlisting'),
    body('min_cgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('Min CGPA must be between 0 and 10'),
    body('exp_required').optional().isInt({ min: 0 }).withMessage('Experience must be non-negative integer in months'),
    body('description').notEmpty().withMessage('Job description is required'),
    validateRequest
], createJob);

router.get('/me', getRecruiterJobs);

module.exports = router;
