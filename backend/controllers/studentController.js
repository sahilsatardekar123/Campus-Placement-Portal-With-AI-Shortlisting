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
        const { full_name, branch, graduation_year, cgpa, skills, experience, projects, resume_url } = req.body;

        const result = await db.query(
            `UPDATE students 
             SET full_name = $1, branch = $2, graduation_year = $3, cgpa = $4, 
                 skills = $5, experience = $6, projects = $7, resume_url = $8, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $9 RETURNING *`,
            [full_name, branch, graduation_year, cgpa, skills, experience, projects, resume_url, studentId]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

const { parseResumePdf } = require('../services/resumeParser');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const parseResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No resume file uploaded.' });
        }

        const fileBuffer = req.file.buffer;

        // 1. Pass to the AI Service for parsing (this is fast)
        const extractedSkills = await parseResumePdf(fileBuffer);

        // 2. Upload the exact same buffer to Cloudinary using a stream
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'placement_resumes',
                        resource_type: 'raw',
                        format: 'pdf'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        const cloudinaryResult = await uploadToCloudinary();

        res.json({
            success: true,
            skills: extractedSkills,
            resume_url: cloudinaryResult.secure_url,
            message: 'Successfully extracted skills and uploaded resume.'
        });
    } catch (error) {
        console.error('Resume Processing Error:', error);
        next(new Error('Failed to process and upload resume.'));
    }
};

module.exports = { getProfile, updateProfile, parseResume };
