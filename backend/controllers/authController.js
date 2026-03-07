// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');

const register = async (req, res, next) => {
    // Start session for Mongoose transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, role, full_name, company_name } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert into users
        const newUser = new User({ email, password_hash, role });
        await newUser.save({ session });

        // Insert into role-specific collection
        if (role === 'student') {
            const newStudent = new Student({
                user_id: newUser._id,
                full_name,
                branch: '',
                graduation_year: 0,
                cgpa: 0,
                skills: '',
                experience: 0,
                projects: ''
            });
            await newStudent.save({ session });
        } else if (role === 'recruiter') {
            const newRecruiter = new Recruiter({
                user_id: newUser._id,
                full_name,
                company_name: company_name || ''
            });
            await newRecruiter.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        // Generate token
        const token = jwt.sign({ id: newUser._id, role }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '7d'
        });

        res.status(201).json({ success: true, token, role });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '7d'
        });

        res.json({ success: true, token, role: user.role });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
