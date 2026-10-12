export const PET_TYPES = [
  { id: 'all', label: 'All Pets', icon: '🐾' },
  { id: 'dog', label: 'Dogs', icon: '🐕' },
  { id: 'cat', label: 'Cats', icon: '🐈' },
  { id: 'bird', label: 'Birds', icon: '🦜' },
  { id: 'fish', label: 'Fish & Aqua', icon: '🐠' },
  { id: 'small_animal', label: 'Small Pets', icon: '🐹' },
];

export const CATEGORIES = [
  { id: 'food', label: 'Pet Food & Nutrition', icon: '🍖', count: 48 },
  { id: 'treats', label: 'Healthy Treats & Chews', icon: '🦴', count: 24 },
  { id: 'toys', label: 'Play Toys & Puzzles', icon: '🎾', count: 32 },
  { id: 'grooming', label: 'Grooming & Shampoos', icon: '🛁', count: 18 },
  { id: 'health', label: 'Supplements & Medicine', icon: '💊', count: 16 },
  { id: 'accessories', label: 'Collars, Leashes & Beds', icon: '🛏️', count: 29 },
];

export const LIFE_STAGES = [
  { id: 'all', label: 'All Ages' },
  { id: 'puppy_kitten', label: 'Puppy / Kitten (< 1 yr)' },
  { id: 'junior', label: 'Junior (1 - 2 yrs)' },
  { id: 'adult', label: 'Adult (2 - 7 yrs)' },
  { id: 'senior', label: 'Senior (7+ yrs)' },
];

export const BRANDS = [
  'Royal Canin',
  'Drools',
  'Pedigree',
  'Whiskas',
  'Farmina N&D',
  'Himalaya Pet Care',
  'Purina Supercoat',
  'Orijen',
  'Acana',
];

export const DIETARY_REQUIREMENTS = [
  'Grain-Free',
  'High-Protein',
  'Hypoallergenic / Sensitive Skin',
  'Weight Management',
  'Joint & Mobility Support',
  'Hairball Control',
  'Dental Care',
];

export const BREEDS_BY_PET = {
  dog: [
    'Golden Retriever',
    'German Shepherd',
    'Labrador Retriever',
    'Pug',
    'Tibetan Mastiff (Bhote Kukur)',
    'Beagle',
    'Siberian Husky',
    'Shih Tzu',
    'Spitz / Japanese Spitz',
    'Mixed Breed / Nepali Local',
  ],
  cat: [
    'Persian Cat',
    'British Shorthair',
    'Siamese',
    'Maine Coon',
    'Ragdoll',
    'Nepali Domestic Shorthair',
  ],
  bird: ['Budgerigar', 'Cockatiel', 'Lovebird', 'African Grey'],
  fish: ['Goldfish', 'Betta', 'Guppy', 'Molly', 'Angelfish'],
  small_animal: ['Syrian Hamster', 'Guinea Pig', 'Rabbit', 'Chinchilla'],
};

export const DELIVERY_ZONES = [
  {
    id: 'valley_inside',
    name: 'Kathmandu Valley (Inside Ring Road)',
    cost: 100,
    estimatedDays: 'Same-day or 24 hours',
    cities: ['Kathmandu Central', 'Lalitpur City', 'Patan', 'Baluwatar', 'Baneshwor'],
  },
  {
    id: 'valley_outside',
    name: 'Kathmandu Valley (Outside Ring Road / Suburbs)',
    cost: 150,
    estimatedDays: '1 - 2 days',
    cities: ['Bhaktapur', 'Budhanilkantha', 'Kirtipur', 'Godawari', 'Suryabinayak', 'Tokha'],
  },
  {
    id: 'outside_valley',
    name: 'Major Cities Outside Valley',
    cost: 250,
    estimatedDays: '2 - 4 business days',
    cities: ['Pokhara', 'Chitwan / Narayangarh', 'Butwal', 'Biratnagar', 'Dharan', 'Nepalgunj', 'Hetauda', 'Bhairahawa'],
  },
];

export const PAYMENT_METHODS = [
  {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    desc: 'Pay cash or Scan to Pay at your doorstep anywhere in Nepal.',
    badge: 'Popular in Valley',
  },
  {
    id: 'esewa',
    name: 'eSewa Digital Wallet',
    desc: 'Instant payment via eSewa with cashback & instant verification.',
    badge: 'Fast & Secure',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'khalti',
    name: 'Khalti Wallet / Banking',
    desc: 'Pay using Khalti balance, connectIPS, or Mobile Banking.',
    badge: 'Instant',
  },
];

export const ORDER_STATUSES = [
  { id: 'pending', label: 'Order Placed', color: 'amber' },
  { id: 'confirmed', label: 'Confirmed', color: 'blue' },
  { id: 'processing', label: 'Packing', color: 'purple' },
  { id: 'shipped', label: 'Shipped (In Transit)', color: 'indigo' },
  { id: 'delivered', label: 'Delivered', color: 'emerald' },
  { id: 'cancelled', label: 'Cancelled', color: 'rose' },
];
