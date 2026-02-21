const mongoose = require('mongoose');

const oauthProviderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: String,
        required: true,
        enum: ['google', 'github', 'facebook', 'other'],
    },
    providerId: {
        type: String,
        required: true,
    },
    profileInfo: {
        type: Object, // Stores raw profile data if needed
    }
}, { timestamps: true });

// Compound index to prevent duplicate provider links for the same provider ID
oauthProviderSchema.index({ provider: 1, providerId: 1 }, { unique: true });
oauthProviderSchema.index({ userId: 1 });

module.exports = mongoose.model('OAuthProvider', oauthProviderSchema);
