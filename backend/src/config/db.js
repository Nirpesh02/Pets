import dns from 'dns';
import mongoose from 'mongoose';

// Fix for Nepal ISP DNS SRV timeout with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

// Disable buffering so requests do not hang if MongoDB is offline or credentials not yet provided
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/pawnepal',
      { serverSelectionTimeoutMS: 10000 }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB not connected yet (${error.message}). Please configure your MONGO_URI in .env`);
  }
};

export default connectDB;
