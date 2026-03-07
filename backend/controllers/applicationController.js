// controllers/applicationController.js
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Ranking = require('../models/Ranking');
const User = require('../models/User');
const { calculateMatchScore } = require('../services/aiRanking');

const applyForJob = async (req, res, next) => {
    console.log("--- applyForJob Endpoint Reached ---");
    console.log("User ID:", req.user.id);
    console.log("Job ID Body:", req.body.job_id);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const studentId = req.user.id;
        const { job_id } = req.body;

        // Verify job exists
        const job = await Job.findById(job_id).session(session);
        if (!job) {
            console.log("Job not found. ID:", job_id);
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: 'Job not found' });
        }

        // Fetch student profile
        const student = await Student.findOne({ user_id: studentId }).session(session);
        if (!student) {
            console.log("Student profile not found. User ID:", studentId);
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: 'Student profile not found' });
        }

        // Allow students to apply even if they haven't explicitly set their skills yet.
        // The AI ranker will just give them a 0 for the skills portion of the match score.

        // Ensure student hasn't applied already
        const existingApp = await Application.findOne({ student_id: student._id, job_id: job._id }).session(session);
        if (existingApp) {
            console.log("Already applied. Student:", student._id, "Job:", job._id);
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: 'Already applied for this job' });
        }

        console.log("Calculating match score...");
        // Calculate AI Match Score
        // The algorithm expects plain objects for calculations
        const rankData = calculateMatchScore(student.toObject(), job.toObject());
        console.log("Rank data calculated:", rankData);

        // Create Application
        const newApplication = new Application({
            student_id: student._id,
            job_id: job._id
        });
        await newApplication.save({ session });

        // Create Ranking
        const newRanking = new Ranking({
            student_id: student._id,
            job_id: job._id,
            match_score: rankData.match_score,
            matched_skills: rankData.matched_skills,
            missing_skills: rankData.missing_skills
        });
        await newRanking.save({ session });

        await session.commitTransaction();
        session.endSession();

        console.log("Application saved successfully.");
        res.status(201).json({
            success: true,
            message: 'Successfully applied',
            rank: rankData
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Catch block in applyForJob:", error);
        // Mongoose duplicate key error code
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Already applied for this job' });
        }
        console.error("Error in applyForJob:", error);
        next(error);
    }
};

const getJobApplicants = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { jobId } = req.params;

        // Find the recruiter document to get the correct ObjectId
        const Recruiter = require('../models/Recruiter');
        const recruiter = await Recruiter.findOne({ user_id: userId });
        if (!recruiter) {
            return res.status(403).json({ success: false, error: 'Recruiter profile not found' });
        }

        // Verify recruiter owns this job
        const job = await Job.findOne({ _id: jobId, recruiter_id: recruiter._id });
        if (!job) {
            return res.status(403).json({ success: false, error: 'Unauthorized or Job not found' });
        }

        // Fetch applications with populated student and ranking
        const rankings = await Ranking.find({ job_id: jobId })
            .sort({ match_score: -1 })
            .populate({
                path: 'student_id',
                populate: {
                    path: 'user_id',
                    select: 'email'
                }
            });

        // The old SQL query joined applications to get applied_at. 
        // We can fetch applications and merge them with rankings.
        const applications = await Application.find({ job_id: jobId }).select('student_id applied_at');
        
        const appMap = applications.reduce((acc, app) => {
            acc[app.student_id.toString()] = app.applied_at;
            return acc;
        }, {});

        // Format to match old SQL response structure
        const formattedApplicants = rankings.map(ranking => {
            const student = ranking.student_id;
            if (!student) {
                return null;
            }
            return {
                applied_at: appMap[student._id.toString()],
                full_name: student.full_name,
                branch: student.branch,
                graduation_year: student.graduation_year,
                cgpa: student.cgpa,
                skills: student.skills,
                experience: student.experience,
                projects: student.projects,
                email: student.user_id ? student.user_id.email : null,
                match_score: ranking.match_score,
                matched_skills: ranking.matched_skills,
                missing_skills: ranking.missing_skills,
                resume_url: student.resume_url // new addition based on previous conversations about Cloudinary
            };
        }).filter(Boolean); // remove format errors if any student is null

        res.json({ success: true, data: formattedApplicants });
    } catch (error) {
        next(error);
    }
};

const getStudentApplications = async (req, res, next) => {
    try {
        const userId = req.user.id; // user._id

        // We first need the student document id
        const student = await Student.findOne({ user_id: userId });
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        const applications = await Application.find({ student_id: student._id })
            .sort({ applied_at: -1 })
            .populate({
                path: 'job_id',
                populate: {
                    path: 'recruiter_id',
                    select: 'company_name'
                }
            });

        const rankings = await Ranking.find({ student_id: student._id });
        const rankingMap = rankings.reduce((acc, rank) => {
            acc[rank.job_id.toString()] = rank.match_score;
            return acc;
        }, {});

        // Format to match old SQL response structure
        const formattedApps = applications.map(app => {
            const job = app.job_id;
            const match_score = rankingMap[job._id.toString()];

            return {
                applied_at: app.applied_at,
                job_id: job._id,
                title: job.title,
                skills_required: job.skills_required,
                company_name: job.recruiter_id ? job.recruiter_id.company_name : null,
                match_score: match_score !== undefined ? match_score : null,
                resume_url: student.resume_url // include the student's resume
            };
        });

        res.json({ success: true, data: formattedApps });
    } catch (error) {
        next(error);
    }
};

const withdrawApplication = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { jobId } = req.params;

        const student = await Student.findOne({ user_id: userId }).session(session);
        if (!student) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: 'Student not found' });
        }

        // Verify application exists
        const app = await Application.findOne({ student_id: student._id, job_id: jobId }).session(session);

        if (!app) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Delete from rankings
        await Ranking.deleteOne({ student_id: student._id, job_id: jobId }).session(session);

        // Delete from applications
        await Application.deleteOne({ _id: app._id }).session(session);

        await session.commitTransaction();
        session.endSession();

        res.json({ success: true, message: 'Application withdrawn successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

module.exports = { applyForJob, getJobApplicants, getStudentApplications, withdrawApplication };
