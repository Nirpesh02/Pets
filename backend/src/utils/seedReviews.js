import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pawnepal');
    console.log('MongoDB connected for review seeding...');

    const products = await Product.find();
    if (!products || products.length === 0) {
      console.log('No products found to seed reviews for.');
      process.exit(0);
    }

    // Check if customer users exist, else create realistic ones
    let sujan = await User.findOne({ email: 'sujan.bajra@gmail.com' });
    if (!sujan) {
      sujan = await User.create({
        name: 'Sujan Bajracharya',
        email: 'sujan.bajra@gmail.com',
        password: 'password123',
        role: 'customer',
        phone: '+977 9841234567',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        address: { street: 'Baluwatar', city: 'Kathmandu' },
      });
    }

    let shradha = await User.findOne({ email: 'shradha.adhikari@gmail.com' });
    if (!shradha) {
      shradha = await User.create({
        name: 'Shradha Adhikari',
        email: 'shradha.adhikari@gmail.com',
        password: 'password123',
        role: 'customer',
        phone: '+977 9818765432',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        address: { street: 'Jhamsikhel', city: 'Lalitpur' },
      });
    }

    let prashant = await User.findOne({ email: 'prashant.gurung@gmail.com' });
    if (!prashant) {
      prashant = await User.create({
        name: 'Prashant Gurung',
        email: 'prashant.gurung@gmail.com',
        password: 'password123',
        role: 'customer',
        phone: '+977 9801239876',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
        address: { street: 'Lakeside', city: 'Pokhara' },
      });
    }

    // Clean existing reviews if needed or insert if empty
    const existingCount = await Review.countDocuments();
    if (existingCount === 0) {
      const sampleReviews = [
        {
          product: products[0]._id, // Royal Canin Golden Retriever
          user: sujan._id,
          userName: sujan.name,
          userAvatar: sujan.avatar,
          rating: 5,
          comment:
            'Ordering Royal Canin for my Golden Retriever in Baluwatar used to take 2-3 days. PawNepal delivered it within 4 hours, and the expiry was 18 months away! Highly recommended.',
          petInfo: 'Kathmandu • Dog Parent to Bruno 🐕',
          isFeaturedOnHome: true, // Featured on homepage!
        },
        {
          product: products[2] ? products[2]._id : products[0]._id, // Whiskas Cat Food
          user: shradha._id,
          userName: shradha.name,
          userAvatar: shradha.avatar,
          rating: 5,
          comment:
            'The personalized pet diet feature helped me find hypoallergenic cat food for my Persian cat Luna. eSewa payment was seamless and hassle-free.',
          petInfo: 'Jhamsikhel, Lalitpur • Cat Parent to Luna 🐈',
          isFeaturedOnHome: true, // Featured on homepage!
        },
        {
          product: products[3] ? products[3]._id : products[0]._id, // Himalaya Erina
          user: prashant._id,
          userName: prashant.name,
          userAvatar: prashant.avatar,
          rating: 5,
          comment:
            'Shipped all the way to Pokhara Lakeside in 2 days. The herbal tick shampoo and dental bones arrived in perfect bubble wrapping with a tax invoice.',
          petInfo: 'Pokhara • Dog Parent to Rocky 🐕',
          isFeaturedOnHome: true, // Featured on homepage!
        },
        {
          product: products[1] ? products[1]._id : products[0]._id, // Drools Puppy Food
          user: sujan._id,
          userName: sujan.name,
          userAvatar: sujan.avatar,
          rating: 4,
          comment:
            'Very high protein and fresh batch for my puppy. Good digestive tolerance and coat shine within 3 weeks.',
          petInfo: 'Kathmandu • Puppy Parent',
          isFeaturedOnHome: false, // Not featured yet (admin can add it to client side!)
        },
      ];

      await Review.insertMany(sampleReviews);
      console.log('✅ Seeded initial authentic client reviews successfully!');

      // Recalculate rating for products
      for (const prod of products) {
        const revs = await Review.find({ product: prod._id });
        if (revs.length > 0) {
          const avg = Number((revs.reduce((a, b) => a + b.rating, 0) / revs.length).toFixed(1));
          await Product.findByIdAndUpdate(prod._id, { rating: avg, reviewCount: revs.length });
        }
      }
    } else {
      console.log(`Reviews already exist (${existingCount}). Skipping seeding.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();
