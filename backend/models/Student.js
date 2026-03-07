const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    full_name: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        default: ''
    },
    graduation_year: {
        type: Number,
        default: 0
    },
    cgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    skills: {
        type: String,
        default: ''
    },
    experience: {
        type: Number,
        default: 0
    },
    projects: {
        type: String
    },
    resume_url: {
        type: String,
        default: ''
    }
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

module.exports = mongoose.model('Student', studentSchema);
