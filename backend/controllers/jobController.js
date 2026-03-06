// controllers/jobController.js
const db = require('../db');

const createJob = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;
        const { title, skills_required, min_cgpa, exp_required, description } = req.body;

        const result = await db.query(
            `INSERT INTO jobs (recruiter_id, title, skills_required, min_cgpa, exp_required, description) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [recruiterId, title, skills_required, min_cgpa || 0, exp_required || 0, description]
        );

        // TODO: Could trigger recalculation for all existing students if needed, 
        // but typically students apply *after* job creation.

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const getJobs = async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT j.*, r.company_name 
             FROM jobs j 
             JOIN recruiters r ON j.recruiter_id = r.user_id 
             ORDER BY j.created_at DESC`
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const getRecruiterJobs = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;
        const result = await db.query(
            `SELECT * FROM jobs WHERE recruiter_id = $1 ORDER BY created_at DESC`,
            [recruiterId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;
        const jobId = req.params.id;

        // Verify the job belongs to this recruiter
        const checkResult = await db.query(
            'SELECT id FROM jobs WHERE id = $1 AND recruiter_id = $2',
            [jobId, recruiterId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Job not found or unauthorized' });
        }

        await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);

        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createJob, getJobs, getRecruiterJobs, deleteJob };
