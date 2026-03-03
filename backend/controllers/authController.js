// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const register = async (req, res, next) => {
    try {
        const { email, password, role, full_name, company_name } = req.body;

        // Check if user exists
        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Begin transaction
        await db.query('BEGIN');

        // Insert into users
        const userResult = await db.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
            [email, password_hash, role]
        );
        const userId = userResult.rows[0].id;

        // Insert into role-specific table
        if (role === 'student') {
            await db.query(
                `INSERT INTO students (user_id, full_name, branch, graduation_year, cgpa, skills, experience, projects) 
                 VALUES ($1, $2, '', 0, 0, '', 0, '')`,
                [userId, full_name]
            );
        } else if (role === 'recruiter') {
            await db.query(
                `INSERT INTO recruiters (user_id, full_name, company_name) 
                 VALUES ($1, $2, $3)`,
                [userId, full_name, company_name || '']
            );
        }

        await db.query('COMMIT');

        // Generate token
        const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '7d'
        });

        res.status(201).json({ success: true, token, role });
    } catch (error) {
        await db.query('ROLLBACK');
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '7d'
        });

        res.json({ success: true, token, role: user.role });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
