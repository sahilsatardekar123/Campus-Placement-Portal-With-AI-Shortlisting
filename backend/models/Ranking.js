const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    match_score: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    matched_skills: {
        type: String // We will store comma-separated strings to maintain backward compatibility with original schema unless refactored later
    },
    missing_skills: {
        type: String
    }
}, { timestamps: { createdAt: 'calculated_at', updatedAt: false } });

// Efficient querying/sorting for job rankings
rankingSchema.index({ job_id: 1, match_score: -1 });
// Ensure one ranking per application
rankingSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

module.exports = mongoose.model('Ranking', rankingSchema);
