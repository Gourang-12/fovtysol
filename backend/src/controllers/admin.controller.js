const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ImpersonationLog = require('../models/ImpersonationLog');
const { generateAccessToken } = require('../utils/generateTokens');

exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const isBlocked = req.query.isBlocked;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (isBlocked !== undefined && isBlocked !== '') query.isBlocked = isBlocked === 'true';

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -refreshToken')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

        const user = await User.create({ name, email, password, role });
        user.password = undefined;

        res.status(201).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, role, isBlocked } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user._id.toString() === req.user._id.toString() && role && role !== 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot remove your own admin role' });
        }

        if (name) user.name = name;
        if (role) user.role = role;
        if (isBlocked !== undefined) user.isBlocked = isBlocked;

        await user.save();
        user.password = undefined;
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.impersonateUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const adminId = req.user._id;

        const targetUser = await User.findById(targetUserId).select('-password -refreshToken');
        if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });
        if (targetUser.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot impersonate another admin' });
        }

        await ImpersonationLog.create({ adminId, targetUserId, action: 'start' });

        const token = jwt.sign(
            { userId: targetUser._id, role: targetUser.role, impersonatorId: adminId },
            process.env.ACCESS_TOKEN_SECRET || 'access_secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({ success: true, impersonationToken: token, user: targetUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
