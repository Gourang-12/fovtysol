const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        // In development, allow any localhost port
        if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
            return callback(null, true);
        }
        // In production, only allow CLIENT_URL
        const allowed = process.env.CLIENT_URL || 'http://localhost:5173';
        if (origin === allowed) return callback(null, true);
        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Root route so users can easily check if backend is running from a browser
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Fovty Solutions Backend API! The server is running perfectly." });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ success: false, message });
});

module.exports = app;
