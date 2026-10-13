import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

import dotenv from 'dotenv';
dotenv.config();


import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import PetProfile from '../models/PetProfile.js';
import Category from '../models/Category.js';
import Banner from '../models/Banner.js';
import Order from '../models/Order.js';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pawnepal');
  console.log('MongoDB Connected for Seeder...');
};

const SEED_USERS = [
  {
    name: 'Nirpesh Dhungel',
    email: 'nirpeshdhungel7@gmail.com',
    password: '123456',
    role: 'admin',
    isSuperAdmin: true,
    phone: '+977 9800000001',
    address: { street: 'Gauradaha Ward -2', city: 'Jhapa' },
  },
];

const SEED_CATEGORIES = [
  { name: 'Pet Food & Nutrition', slug: 'food', icon: '🍖', count: 48 },
  { name: 'Healthy Treats & Chews', slug: 'treats', icon: '🦴', count: 24 },
  { name: 'Play Toys & Puzzles', slug: 'toys', icon: '🎾', count: 32 },
  { name: 'Grooming & Shampoos', slug: 'grooming', icon: '🛁', count: 18 },
  { name: 'Supplements & Medicine', slug: 'health', icon: '💊', count: 16 },
  { name: 'Collars, Leashes & Beds', slug: 'accessories', icon: '🛏️', count: 29 },
];

const SEED_BANNERS = [
  {
    title: 'Kathmandu Valley Express 🐾',
    subtitle: 'Same-day pet nutrition delivery inside Ring Road. Pay via Cash on Delivery.',
    badge: 'Same-Day Delivery in Valley',
    ctaText: 'Shop Vet-Approved Food',
    ctaLink: '/shop?category=food',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    title: 'Personalized Pet Nutrition Guide',
    subtitle: 'Add your pet profile (Breed, Age & Allergies) to unlock customized meal plans.',
    badge: 'Tailored for Your Furry Friend',
    ctaText: 'Create Pet Profile',
    ctaLink: '/pet-profile',
    bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1000&auto=format&fit=crop&q=80',
    active: true,
  },
];

export { SEED_DOG_BANNER_IMAGES } from '../constants/dogBannerPresets.js';

const SEED_PRODUCTS = [
  {
    name: 'Royal Canin Golden Retriever Adult Dry Food',
    brand: 'Royal Canin',
    petType: 'dog',
    category: 'food',
    lifeStage: 'adult',
    breedSpecific: 'Golden Retriever',
    price: 4950,
    originalPrice: 5500,
    discountPercent: 10,
    rating: 4.9,
    reviewCount: 42,
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 18,
    batchNumber: 'RC-NP-2025-09A',
    expiryDate: new Date('2027-04-15'),
    dietaryTags: ['High-Protein', 'Joint & Mobility Support'],
    variants: [
      { weight: '3 kg', price: 4950, stock: 12 },
      { weight: '12 kg', price: 17200, stock: 6 },
    ],
    shortDesc: 'Tailor-made nutrition for purebred Golden Retrievers over 15 months old.',
    description: 'Enriched with EPA & DHA, borage oil, and tailored calorie content for adult Golden Retrievers in Nepali climate conditions.',
    feedingGuide: [
      { petWeight: '26 kg', normalActivity: '315 g / day', highActivity: '365 g / day' },
      { petWeight: '30 kg', normalActivity: '350 g / day', highActivity: '405 g / day' },
    ],
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Drools Focus Super Premium Puppy Food',
    brand: 'Drools',
    petType: 'dog',
    category: 'food',
    lifeStage: 'puppy_kitten',
    breedSpecific: 'All Breeds',
    price: 2150,
    originalPrice: 2400,
    discountPercent: 10,
    rating: 4.7,
    reviewCount: 88,
    images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 25,
    batchNumber: 'DF-NP-2025-11B',
    expiryDate: new Date('2026-12-30'),
    dietaryTags: ['High-Protein', 'Brain & Eye Development'],
    variants: [
      { weight: '1.2 kg', price: 1100, stock: 15 },
      { weight: '4 kg', price: 2150, stock: 10 },
    ],
    shortDesc: 'Wholesome formula with Real Chicken to build strong puppy immunity.',
    description: 'No wheat or artificial fillers. Made with prebiotic fiber for gentle puppy digestion.',
    feedingGuide: [
      { petWeight: '2-5 kg', normalActivity: '60 - 110 g / day', highActivity: '130 g / day' },
    ],
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Whiskas Ocean Fish Adult Cat Wet & Dry Feast',
    brand: 'Whiskas',
    petType: 'cat',
    category: 'food',
    lifeStage: 'adult',
    breedSpecific: 'All Breeds',
    price: 1350,
    originalPrice: 1500,
    discountPercent: 10,
    rating: 4.8,
    reviewCount: 65,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 30,
    batchNumber: 'WK-NP-2025-04K',
    expiryDate: new Date('2027-02-18'),
    dietaryTags: ['Hairball Control', 'Urinary Health'],
    variants: [
      { weight: '1.2 kg', price: 1350, stock: 20 },
      { weight: '3 kg', price: 2900, stock: 10 },
    ],
    shortDesc: 'Delicious crunchy pockets with soft meat center for shining feline coat.',
    description: 'Complete and balanced cat food, specially designed for adult cats over 1 year.',
    feedingGuide: [
      { petWeight: '2 - 3 kg', normalActivity: '35 - 45 g / day', highActivity: '50 g / day' },
    ],
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Himalaya Erina-EP Flea & Tick Anti-Microbial Shampoo',
    brand: 'Himalaya Pet Care',
    petType: 'dog',
    category: 'grooming',
    lifeStage: 'all',
    breedSpecific: 'All Breeds',
    price: 520,
    originalPrice: 580,
    discountPercent: 10,
    rating: 4.9,
    reviewCount: 112,
    images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 40,
    batchNumber: 'HIM-EP-2025-08',
    expiryDate: new Date('2027-09-01'),
    dietaryTags: ['Ayurvedic Care', 'Sensitive Skin'],
    variants: [{ weight: '200 ml', price: 520, stock: 40 }],
    shortDesc: 'Ayurvedic herbal blend featuring Neem and Eucalyptus for repelling ticks.',
    description: 'Safe for regular use. Prevents reinfestation and eliminates unpleasant odor.',
    feedingGuide: [],
    isFeatured: false,
    isBestseller: true,
  },
  {
    name: 'Vitapol Economic Food for Cockatiel & Medium Parrots',
    brand: 'Vitapol',
    petType: 'bird',
    category: 'food',
    lifeStage: 'adult_bird',
    breedSpecific: 'Cockatiel',
    price: 650,
    originalPrice: 750,
    discountPercent: 13,
    rating: 4.8,
    reviewCount: 34,
    images: ['https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 22,
    batchNumber: 'VP-BIRD-2026-NP',
    expiryDate: new Date('2027-08-30'),
    dietaryTags: ['Grain-Free', 'High-Protein'],
    variants: [
      { weight: '500 g', price: 650, stock: 14 },
      { weight: '1 kg', price: 1200, stock: 8 },
    ],
    shortDesc: 'Nutrient-rich seed mix formulated for cockatiels and lovebirds in Nepal.',
    description: 'Selected grains, flaxseed, and sunflower seeds providing essential fats and vitamins for shiny feathers.',
    feedingGuide: [],
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Petslife Hand Feeding Formula for Baby Birds & Chicks',
    brand: 'Petslife',
    petType: 'bird',
    category: 'food',
    lifeStage: 'chick_hatchling',
    breedSpecific: 'All Breeds',
    price: 1150,
    originalPrice: 1300,
    discountPercent: 11,
    rating: 4.9,
    reviewCount: 19,
    images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 18,
    batchNumber: 'PL-CHICK-2026',
    expiryDate: new Date('2027-10-15'),
    dietaryTags: ['High-Protein'],
    variants: [{ weight: '500 g', price: 1150, stock: 18 }],
    shortDesc: 'Instant hand-rearing formula for newborn chicks and fledglings.',
    description: 'Enriched with prebiotics, digestive enzymes, and optimum protein to promote rapid growth in baby birds.',
    feedingGuide: [],
    isFeatured: false,
    isBestseller: true,
  },
  {
    name: 'Taiyo Special Red Goldfish Flakes & Floating Pellets',
    brand: 'Taiyo',
    petType: 'fish',
    category: 'food',
    lifeStage: 'adult_fish',
    breedSpecific: 'Goldfish',
    price: 320,
    originalPrice: 380,
    discountPercent: 15,
    rating: 4.7,
    reviewCount: 52,
    images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 35,
    batchNumber: 'TY-FISH-2026-01',
    expiryDate: new Date('2027-12-31'),
    dietaryTags: ['High-Protein'],
    variants: [
      { weight: '100 g', price: 320, stock: 25 },
      { weight: '330 g', price: 780, stock: 10 },
    ],
    shortDesc: 'Color-enhancing spirulina floating pellets for goldfish in Nepali home aquariums.',
    description: 'Rich in natural carotenoids and vitamin C. Does not cloud water and boosts natural coloration.',
    feedingGuide: [],
    isFeatured: true,
    isBestseller: true,
  },
  {
    name: 'Optimum Micro Pellets for Baby Fish & Fry',
    brand: 'Optimum',
    petType: 'fish',
    category: 'food',
    lifeStage: 'fry_larvae',
    breedSpecific: 'Guppy',
    price: 260,
    originalPrice: 300,
    discountPercent: 13,
    rating: 4.8,
    reviewCount: 27,
    images: ['https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80'],
    inStock: true,
    stockCount: 28,
    batchNumber: 'OPT-FRY-2026-NP',
    expiryDate: new Date('2027-09-15'),
    dietaryTags: ['High-Protein'],
    variants: [{ weight: '50 g', price: 260, stock: 28 }],
    shortDesc: 'Ultra-fine starter micro pellets for growing fish fry, guppies, and neon tetras.',
    description: 'Slowly sinking micro crumble with 40%+ protein to support rapid fry development and immunity.',
    feedingGuide: [],
    isFeatured: false,
    isBestseller: false,
  },
];

const importData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Banner.deleteMany();
    await PetProfile.deleteMany();
    await Order.deleteMany();

    await User.create(SEED_USERS);

    await Category.insertMany(SEED_CATEGORIES);
    await Banner.insertMany(SEED_BANNERS);
    await Product.insertMany(SEED_PRODUCTS);


    console.log('✅ Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Banner.deleteMany();
    await PetProfile.deleteMany();
    await Order.deleteMany();

    console.log('🗑️ All data destroyed.');
    process.exit();
  } catch (err) {
    console.error('❌ Error destroying data:', err);
    process.exit(1);
  }
};

const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seeder.js');
if (isDirectRun) {
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    importData();
  }
}
