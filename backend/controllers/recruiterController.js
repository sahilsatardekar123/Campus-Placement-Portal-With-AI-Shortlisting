// controllers/recruiterController.js
const Recruiter = require('../models/Recruiter');

const getProfile = async (req, res, next) => {
    try {
        const recruiterId = req.user.id;

        const recruiter = await Recruiter.findOne({ user_id: recruiterId }).populate('user_id', 'email');

        if (!recruiter) {
            return res.status(404).json({ success: false, error: 'Recruiter not found' });
        }

        // Format to match old SQL response: email at top level, with recruiter fields
        const responseData = {
            ...recruiter.toObject(),
            email: recruiter.user_id.email
        };
        responseData.user_id = recruiterId;

        res.json({ success: true, data: responseData });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile };
