// In-memory constants and initial references for PawNepal
// Note: LocalStorage is disabled per project requirements. All data is fetched from the backend API.

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
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
    images: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
    ],
    inStock: true,
    stockCount: 18,
    batchNumber: 'RC-NP-2025-09A',
    expiryDate: '2027-04-15',
    dietaryTags: ['High-Protein', 'Joint & Mobility Support'],
    variants: [
      { weight: '3 kg', price: 4950, stock: 12 },
      { weight: '12 kg', price: 17200, stock: 6 },
    ],
    shortDesc: 'Tailor-made nutrition for purebred Golden Retrievers over 15 months old.',
  },
];
