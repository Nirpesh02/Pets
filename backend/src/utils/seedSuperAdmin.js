import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';

const seedSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pawnepal';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB Connected for Super Admin seed...');

    const email = 'nirpeshdhungel7@gmail.com';
    const password = '123456';

    let user = await User.findOne({ email });
    if (user) {
      user.name = 'Nirpesh Dhungel';
      user.password = password; // Will be hashed by pre('save') hook
      user.role = 'admin';
      user.isSuperAdmin = true;
      user.isBlocked = false;
      await user.save();
      console.log(`✅ Super Admin updated successfully: ${email} / ${password}`);
    } else {
      user = await User.create({
        name: 'Nirpesh Dhungel',
        email,
        password,
        role: 'admin',
        isSuperAdmin: true,
        phone: '+977 9800000001',
        address: { street: 'Baluwatar', city: 'Kathmandu' },
      });
      console.log(`✅ Super Admin created successfully: ${email} / ${password}`);
    }

    // Delete old static users (admin@pawnepal.com & customer@pawnepal.com)
    const deleted = await User.deleteMany({
      email: { $in: ['admin@pawnepal.com', 'customer@pawnepal.com'] }
    });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️ Removed ${deleted.deletedCount} old static user(s) (admin@pawnepal.com / customer@pawnepal.com) from database.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
