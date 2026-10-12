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

export const DOG_BANNER_PRESETS = [
  {
    id: 'dog_1',
    name: 'Golden Retriever Joy',
    breed: 'Golden Retriever',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&auto=format&fit=crop&q=80',
    description: 'Happy smiling golden retriever portrait',
  },
  {
    id: 'dog_2',
    name: 'German Shepherd Guardian',
    breed: 'German Shepherd',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80',
    description: 'Noble and alert German shepherd in nature',
  },
  {
    id: 'dog_3',
    name: 'Siberian Husky Frost',
    breed: 'Siberian Husky',
    url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=1200&auto=format&fit=crop&q=80',
    description: 'Majestic Siberian husky with piercing blue eyes',
  },
  {
    id: 'dog_4',
    name: 'Playful Labrador Pup',
    breed: 'Labrador Retriever',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&auto=format&fit=crop&q=80',
    description: 'Cute golden lab puppy ready to play',
  },
  {
    id: 'dog_5',
    name: 'French Bulldog Charm',
    breed: 'French Bulldog',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop&q=80',
    description: 'Adorable French bulldog wearing cozy knitwear',
  },
  {
    id: 'dog_6',
    name: 'Fluffy Pomeranian Smile',
    breed: 'Pomeranian',
    url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&auto=format&fit=crop&q=80',
    description: 'Fluffy white Pomeranian companion',
  },
  {
    id: 'dog_7',
    name: 'Curious Beagle Explorer',
    breed: 'Beagle',
    url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=1200&auto=format&fit=crop&q=80',
    description: 'Friendly beagle enjoying outdoor adventure',
  },
  {
    id: 'dog_8',
    name: 'Border Collie Agility',
    breed: 'Border Collie',
    url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=1200&auto=format&fit=crop&q=80',
    description: 'Intelligent black and white border collie',
  },
  {
    id: 'dog_9',
    name: 'Cheerful Corgi Smile',
    breed: 'Welsh Corgi',
    url: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=1200&auto=format&fit=crop&q=80',
    description: 'Cute Pembroke Welsh corgi running happily',
  },
  {
    id: 'dog_10',
    name: 'Doberman Pinscher Strength',
    breed: 'Doberman Pinscher',
    url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=1200&auto=format&fit=crop&q=80',
    description: 'Athletic, powerful guardian dog',
  },
];
