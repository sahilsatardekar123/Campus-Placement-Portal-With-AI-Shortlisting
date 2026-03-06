// routes/applications.js
const express = require('express');
const { body } = require('express-validator');
const { applyForJob, getJobApplicants, getStudentApplications, withdrawApplication } = require('../controllers/applicationController');
const { auth, authorizeRole } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

const router = express.Router();
router.use(auth);

// Student applying for a job
router.post('/', authorizeRole('student'), [
    body('job_id').isInt().withMessage('Valid Job ID is required'),
    validateRequest
], applyForJob);

// Student viewing their own applications
router.get('/me', authorizeRole('student'), getStudentApplications);

// Recruiter getting applicants for their job
router.get('/:jobId/applicants', authorizeRole('recruiter'), getJobApplicants);

// Student withdrawing an application
router.delete('/:jobId', authorizeRole('student'), withdrawApplication);

module.exports = router;
