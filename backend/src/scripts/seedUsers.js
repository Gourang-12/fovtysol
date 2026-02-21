require('dotenv').config();
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing users if needed - CAUTION: only for demo
        // await User.deleteMany({});

        const usersData = [
            {
                name: 'System Admin',
                email: 'admin@test.com',
                password: 'password123',
                role: 'admin',
                phone: '1234567890',
                bio: 'Main system administrator'
            },
            {
                name: 'John Doe',
                email: 'john@user.com',
                password: 'password123',
                role: 'user',
                phone: '0987654321',
                bio: 'Regular active user'
            },
            {
                name: 'Jane Smith',
                email: 'jane@user.com',
                password: 'password123',
                role: 'user',
                isBlocked: true,
                bio: 'This user is currently blocked'
            },
            {
                name: 'Alice Johnson',
                email: 'alice@test.com',
                password: 'password123',
                role: 'user',
                bio: 'Product manager'
            },
            {
                name: 'Bob Wilson',
                email: 'bob@test.com',
                password: 'password123',
                role: 'user',
                phone: '5551234567'
            }
        ];

        for (const userData of usersData) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                await User.create(userData);
                console.log(`User created: ${userData.email}`);
            } else {
                console.log(`User already exists: ${userData.email}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedUsers();
