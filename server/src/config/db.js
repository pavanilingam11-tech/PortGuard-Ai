const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : 'mongodb://localhost:27017/portguard';
    const conn = await mongoose.connect(uri, {
      dbName: 'portguard',
      family: 4,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
