import mongoose from 'mongoose';

const petProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide pet name'],
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Please specify pet species'],
      enum: ['dog', 'cat', 'bird', 'fish', 'small_animal'],
      default: 'dog',
    },
    breed: {
      type: String,
      default: 'Mixed Breed',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      default: 'Male',
    },
    ageYears: {
      type: Number,
      required: [true, 'Please specify age in years'],
      min: [0, 'Age cannot be negative'],
    },
    weightKg: {
      type: Number,
      required: [true, 'Please specify weight in kg'],
      min: [0, 'Weight cannot be negative'],
    },
    dietaryPreference: {
      type: String,
      default: 'Balanced Standard',
    },
    allergies: {
      type: String,
      default: 'None',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80',
    },
    vaccinationUpToDate: {
      type: Boolean,
      default: true,
    },
    lastDeworming: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const PetProfile = mongoose.model('PetProfile', petProfileSchema);
export default PetProfile;
