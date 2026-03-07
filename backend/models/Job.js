const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    skills_required: {
        type: String,
        required: true
    },
    min_cgpa: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    exp_required: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Job', jobSchema);
