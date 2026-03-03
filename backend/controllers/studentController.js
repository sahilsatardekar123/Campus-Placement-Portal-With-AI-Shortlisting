// controllers/studentController.js
const db = require('../db');

const getProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const result = await db.query(
            `SELECT u.email, s.* 
             FROM users u 
             JOIN students s ON u.id = s.user_id 
             WHERE u.id = $1`,
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const { full_name, branch, graduation_year, cgpa, skills, experience, projects } = req.body;

        const result = await db.query(
            `UPDATE students 
             SET full_name = $1, branch = $2, graduation_year = $3, cgpa = $4, 
                 skills = $5, experience = $6, projects = $7, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $8 RETURNING *`,
            [full_name, branch, graduation_year, cgpa, skills, experience, projects, studentId]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile };
