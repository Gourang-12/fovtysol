const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
    register,
    login,
    logout,
    refreshToken,
    googleAuth,
    forgotPassword,
    resetPassword
} = require('../controllers/auth.controller');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
};

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, register);

router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], validate, login);

router.post('/logout', logout);
router.get('/refresh', refreshToken);
router.post('/google', googleAuth);

router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail()
], validate, forgotPassword);

router.post('/reset-password', [
    check('token', 'Token is required').not().isEmpty(),
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], validate, resetPassword);

module.exports = router;
