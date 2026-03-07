const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    }
}, { timestamps: { createdAt: 'applied_at', updatedAt: false } });

// Prevent duplicate applications for the same job by the same student
applicationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
