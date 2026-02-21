const mongoose = require('mongoose');

const connectDB = async () => {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fovty_ums';

    try {
        console.log(`Attempting to connect to MongoDB at: ${uri.split('@')[1] || uri}`);
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('⚠️ Real MongoDB connection failed. Starting an in-memory MongoDB server for testing...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            await mongoose.connect(uri);
            console.log('✅ In-Memory MongoDB connected successfully');
        } catch (memError) {
            console.error('❌ Failed to start in-memory database:', memError);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
