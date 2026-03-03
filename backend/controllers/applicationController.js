// controllers/applicationController.js
const db = require('../db');
const { calculateMatchScore } = require('../services/aiRanking');

const applyForJob = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const { job_id } = req.body;

        // Verify job exists
        const jobResult = await db.query('SELECT * FROM jobs WHERE id = $1', [job_id]);
        if (jobResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Job not found' });
        }
        const job = jobResult.rows[0];

        // Ensure student hasn't applied already
        const checkApp = await db.query(
            'SELECT * FROM applications WHERE student_id = $1 AND job_id = $2',
            [studentId, job_id]
        );
        if (checkApp.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Already applied for this job' });
        }

        // Fetch student profile
        const studentResult = await db.query('SELECT * FROM students WHERE user_id = $1', [studentId]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student profile not found' });
        }
        const student = studentResult.rows[0];

        if (!student.skills) {
            return res.status(400).json({ success: false, error: 'Please update your skills in profile before applying' });
        }

        // Calculate AI Match Score
        const rankData = calculateMatchScore(student, job);

        await db.query('BEGIN');

        // Insert Application
        const appResult = await db.query(
            'INSERT INTO applications (student_id, job_id) VALUES ($1, $2) RETURNING id',
            [studentId, job_id]
        );

        // Insert Ranking
        await db.query(
            `INSERT INTO rankings (student_id, job_id, match_score, matched_skills, missing_skills) 
             VALUES ($1, $2, $3, $4, $5)`,
            [studentId, job_id, rankData.match_score, rankData.matched_skills, rankData.missing_skills]
        );

        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Successfully applied',
            rank: rankData
        });
    } catch (error) {
        await db.query('ROLLBACK');
        if (error.code === '23505') { // Unique constraint violation (just in case concurrency issue)
            return res.status(400).json({ success: false, error: 'Already applied for this job' });
        }
        next(error);
    }
};

const getJobApplicants = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;
        const { jobId } = req.params;

        // Verify recruiter owns this job
        const jobResult = await db.query('SELECT * FROM jobs WHERE id = $1 AND recruiter_id = $2', [jobId, recruiterId]);
        if (jobResult.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Unauthorized or Job not found' });
        }

        // Fetch applicants + students + rankings, ordered by match_score DESC
        const applicants = await db.query(
            `SELECT a.applied_at, s.full_name, s.branch, s.graduation_year, s.cgpa, s.skills, s.experience, s.projects, u.email,
                    r.match_score, r.matched_skills, r.missing_skills
             FROM applications a
             JOIN students s ON a.student_id = s.user_id
             JOIN users u ON s.user_id = u.id
             JOIN rankings r ON a.student_id = r.student_id AND a.job_id = r.job_id
             WHERE a.job_id = $1
             ORDER BY r.match_score DESC`,
            [jobId]
        );

        res.json({ success: true, data: applicants.rows });
    } catch (error) {
        next(error);
    }
};

const getStudentApplications = async (req, res, next) => {
    try {
        const studentId = req.user.id;

        // Fetch jobs student applied to
        const result = await db.query(
            `SELECT a.applied_at, j.title, j.skills_required, r.company_name, rk.match_score
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN recruiters r ON j.recruiter_id = r.user_id
             JOIN rankings rk ON a.student_id = rk.student_id AND a.job_id = rk.job_id
             WHERE a.student_id = $1
             ORDER BY a.applied_at DESC`,
            [studentId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

module.exports = { applyForJob, getJobApplicants, getStudentApplications };
