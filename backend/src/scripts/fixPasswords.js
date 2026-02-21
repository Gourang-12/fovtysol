/**
 * Fix script: Restore passwords for users whose passwords were erased by the registration bug.
 * This sets a known password for ALL users that currently have no password field.
 * Run with: node src/scripts/fixPasswords.js
 */
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const DEFAULT_PASSWORD = 'Password123'; // Users can change this after logging in

async function fixPasswords() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fovty_ums';
    console.log('Connecting to MongoDB...');

    await mongoose.connect(uri);
    console.log('✅ Connected!\n');

    // Import model AFTER connection
    const User = require('../models/User');

    // Find all users with no password
    const usersWithoutPassword = await User.find({ password: { $in: [null, undefined, ''] } });

    if (usersWithoutPassword.length === 0) {
        console.log('✅ No users with missing passwords found. All good!');
        process.exit(0);
    }

    console.log(`Found ${usersWithoutPassword.length} user(s) with no password:\n`);

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const user of usersWithoutPassword) {
        console.log(`  → Fixing: ${user.email}`);
        // Use updateOne to bypass the pre-save hook (which would re-hash an already-hashed password)
        await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
    }

    console.log(`\n✅ Done! ${usersWithoutPassword.length} user(s) fixed.`);
    console.log(`\n🔑 All fixed accounts now have password: "${DEFAULT_PASSWORD}"`);
    console.log('   Users can change their password from Profile Settings after logging in.\n');
    process.exit(0);
}

fixPasswords().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
