// controllers/jobController.js
const Job = require('../models/Job');
const Recruiter = require('../models/Recruiter');

const createJob = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const recruiter = await Recruiter.findOne({ user_id: userId });
        if (!recruiter) {
            return res.status(403).json({ success: false, error: 'Recruiter profile not found' });
        }
        const recruiterId = recruiter._id;
        const { title, skills_required, min_cgpa, exp_required, description } = req.body;

        const newJob = new Job({
            recruiter_id: recruiterId,
            title,
            skills_required,
            min_cgpa: min_cgpa || 0,
            exp_required: exp_required || 0,
            description
        });

        await newJob.save();

        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        next(error);
    }
};

const getJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find()
            .populate('recruiter_id', 'company_name')
            .sort({ created_at: -1 });

        // Format response to match expected output structure where company_name is at the top level
        const formattedJobs = jobs.map(job => {
            const jobObj = job.toObject();
            return {
                ...jobObj,
                company_name: job.recruiter_id ? job.recruiter_id.company_name : null,
                recruiter_id: job.recruiter_id ? job.recruiter_id._id : null
            };
        });

        res.json({ success: true, data: formattedJobs });
    } catch (error) {
        next(error);
    }
};

const getRecruiterJobs = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const recruiter = await Recruiter.findOne({ user_id: userId });
        if (!recruiter) {
            return res.status(403).json({ success: false, error: 'Recruiter profile not found' });
        }
        const jobs = await Job.find({ recruiter_id: recruiter._id }).sort({ created_at: -1 });

        res.json({ success: true, data: jobs });
    } catch (error) {
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const recruiter = await Recruiter.findOne({ user_id: userId });
        if (!recruiter) {
            return res.status(403).json({ success: false, error: 'Recruiter profile not found' });
        }
        const jobId = req.params.id;

        // Verify the job belongs to this recruiter
        const job = await Job.findOne({ _id: jobId, recruiter_id: recruiter._id });

        if (!job) {
            return res.status(404).json({ success: false, error: 'Job not found or unauthorized' });
        }

        await Job.deleteOne({ _id: jobId });

        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createJob, getJobs, getRecruiterJobs, deleteJob };
