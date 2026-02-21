const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const OAuthProvider = require('../models/OAuthProvider');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');

const setCookies = (res, accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const stripSensitiveFields = (user) => {
    user.password = undefined;
    user.refreshToken = undefined;
    return user;
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        stripSensitiveFields(user);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || user.isBlocked) {
            return res.status(401).json({
                success: false,
                message: user?.isBlocked ? 'Account blocked' : 'Invalid email or password'
            });
        }

        // Handle accounts with no password (affected by old registration bug or Google-only)
        if (!user.password) {
            const isGoogleOnlyUser = await OAuthProvider.findOne({ userId: user._id, provider: 'google' });
            if (isGoogleOnlyUser) {
                return res.status(401).json({ success: false, message: 'This account uses Google Sign-In.' });
            }
            // Auto-repair: set the password they just typed
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await User.updateOne({ _id: user._id }, { $set: { password: user.password } });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        stripSensitiveFields(user);
        setCookies(res, accessToken, refreshToken);

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await User.findOneAndUpdate({ refreshToken }, { refreshToken: '' });
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret');
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== token || user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user._id, user.role);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({ success: true, message: 'Token refreshed' });
    } catch (error) {
        res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
};

exports.googleAuth = async (req, res) => {
    const { access_token } = req.body;
    try {
        // Fetch user info from Google using the access_token
        const googleRes = await fetch(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: `Bearer ${access_token}` } }
        );
        if (!googleRes.ok) {
            return res.status(401).json({ success: false, message: 'Invalid Google token' });
        }
        const googleUser = await googleRes.json();
        const { sub, email, picture } = googleUser;
        // Google may return 'name' or 'given_name'+'family_name'
        const name = googleUser.name || `${googleUser.given_name || ''} ${googleUser.family_name || ''}`.trim() || email?.split('@')[0];

        if (!email) {
            return res.status(400).json({ success: false, message: 'Could not retrieve email from Google. Please ensure email access is granted.' });
        }

        let user = await User.findOne({ email });
        if (user?.isBlocked) {
            return res.status(403).json({ success: false, message: 'Account blocked' });
        }

        if (!user) {
            user = await User.create({ name, email, profilePicture: picture });
        }

        const existingOAuth = await OAuthProvider.findOne({ provider: 'google', providerId: sub });
        if (!existingOAuth) {
            await OAuthProvider.create({
                userId: user._id,
                provider: 'google',
                providerId: sub,
                profileInfo: { name, email, picture }
            });
        }

        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        setCookies(res, accessToken, refreshToken);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Return generic message to avoid user enumeration
            return res.status(200).json({ success: true, message: 'If this email is registered, a reset link has been sent.' });
        }

        await PasswordReset.deleteMany({ email });

        const resetToken = crypto.randomBytes(32).toString('hex');
        await PasswordReset.create({
            email,
            token: resetToken,
            expiresAt: new Date(Date.now() + 3600000)
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/page-reset-password?token=${resetToken}`;

        await sendPasswordResetEmail(email, resetLink);

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const resetEntry = await PasswordReset.findOne({ token, expiresAt: { $gt: Date.now() } });
        if (!resetEntry) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        const user = await User.findOne({ email: resetEntry.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();
        await PasswordReset.deleteOne({ _id: resetEntry._id });

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
