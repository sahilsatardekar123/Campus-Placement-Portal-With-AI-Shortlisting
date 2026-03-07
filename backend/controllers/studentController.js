// controllers/studentController.js
const Student = require('../models/Student');
const User = require('../models/User');

const getProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const student = await Student.findOne({ user_id: studentId }).populate('user_id', 'email');

        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Format to match old SQL response: email at top level, with student fields
        const responseData = {
            ...student.toObject(),
            email: student.user_id.email
        };
        // avoid duplicating user_id object
        responseData.user_id = studentId;

        res.json({ success: true, data: responseData });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const studentId = req.user.id;
        const { full_name, branch, graduation_year, cgpa, skills, experience, projects, resume_url } = req.body;

        const updatedStudent = await Student.findOneAndUpdate(
            { user_id: studentId },
            {
                full_name, branch, graduation_year, cgpa,
                skills, experience, projects, resume_url
            },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        res.json({ success: true, data: updatedStudent });
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
                        resource_type: 'auto'
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
