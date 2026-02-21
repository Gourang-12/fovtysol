const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET || 'access_secret', {
        expiresIn: '15m'
    });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret', {
        expiresIn: '7d'
    });
};

module.exports = { generateAccessToken, generateRefreshToken };
