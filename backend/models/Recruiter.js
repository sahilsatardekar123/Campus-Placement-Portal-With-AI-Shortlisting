const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
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
    company_name: {
        type: String,
        required: true
    }
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

module.exports = mongoose.model('Recruiter', recruiterSchema);
