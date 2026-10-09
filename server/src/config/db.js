const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : 'mongodb://localhost:27017/portguard';
    const options = {
      dbName: 'portguard',
    };

    // Apply family: 4 only for localhost to accelerate Windows IPv4 resolution without breaking SRV lookups on MongoDB Atlas
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      options.family = 4;
    }

    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
