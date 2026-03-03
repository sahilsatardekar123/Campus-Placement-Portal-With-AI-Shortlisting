// controllers/recruiterController.js
const db = require('../db');

const getProfile = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;
        const result = await db.query(
            `SELECT u.email, r.* 
             FROM users u 
             JOIN recruiters r ON u.id = r.user_id 
             WHERE u.id = $1`,
            [recruiterId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Recruiter not found' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile };
