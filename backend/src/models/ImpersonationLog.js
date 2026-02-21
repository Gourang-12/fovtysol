const mongoose = require('mongoose');

const impersonationLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['start', 'stop'],
        required: true
    },
    actionTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

impersonationLogSchema.index({ adminId: 1, targetUserId: 1 });

const ImpersonationLog = mongoose.model('ImpersonationLog', impersonationLogSchema);
module.exports = ImpersonationLog;
