import React, { useState, useEffect } from 'react';
import {
  PawPrint,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Scale,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { usePet } from '../../hooks/usePet';
import { useAuth } from '../../hooks/useAuth';
import { productApi } from '../../api/productApi';
import { BREEDS_BY_PET, DIETARY_REQUIREMENTS } from '../../utils/constants';
import { formatNPR } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Link } from 'react-router-dom';

export const PetProfile = () => {
  const { pets, activePet, setActivePet, addPet, updatePet, deletePet } = usePet();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    ageYears: 2,
    weightKg: 20,
    dietaryPreference: 'Grain-Free, Joint Support',
    allergies: 'None',
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&auto=format&fit=crop&q=80',
    vaccinationUpToDate: true,
  });

  // Load recommended products for active pet
  useEffect(() => {
    if (activePet) {
      productApi.getProducts({ petType: activePet.species }).then((prods) => {
        setRecommendedProducts(prods.slice(0, 3));
      });
    }
  }, [activePet]);

  const openAddModal = () => {
    setEditingPetId(null);
    setFormData({
      name: '',
      species: 'dog',
      breed: BREEDS_BY_PET.dog[0],
      gender: 'Male',
      ageYears: 2,
      weightKg: 15,
      dietaryPreference: 'Grain-Free',
      allergies: 'None',
      avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop&q=80',
      vaccinationUpToDate: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pet) => {
    setEditingPetId(pet.id);
    setFormData({ ...pet });
    setIsModalOpen(true);
  };

  const handleSpeciesChange = (species) => {
    const defaultBreed = BREEDS_BY_PET[species]?.[0] || 'Mixed Breed';
    const defaultAvatar =
      species === 'cat'
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300'
        : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300';
    setFormData((prev) => ({
      ...prev,
      species,
      breed: defaultBreed,
      avatar: defaultAvatar,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingPetId) {
      await updatePet(editingPetId, formData);
    } else {
      await addPet({
        ...formData,
        userId: user?.id || 'guest',
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="container pet-profile-page-root">
      <div className="pet-page-header">
        <div>
          <h1 className="pet-page-title">Pet Profiles & Dietary Records</h1>
          <p className="pet-page-subtitle">
            Configure your pet's breed, life-stage and allergies to receive vet-tailored nutrition recommendations.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Register New Pet
        </Button>
      </div>

      {/* Pet Cards Grid */}
      <div className="pets-cards-grid">
        {pets && pets.length > 0 ? (
          pets.map((pet) => {
            const petId = pet._id || pet.id;
            const isActive = petId === (activePet?._id || activePet?.id);
            return (
              <div key={petId} className={`pet-profile-card ${isActive ? 'active-pet-card' : ''}`}>
                {isActive && (
                  <div className="active-pet-badge-strip">
                    <Sparkles size={14} /> Active Shopping Companion
                  </div>
                )}

                <div className="pet-card-header">
                  <img src={pet.avatar} alt={pet.name} className="pet-card-avatar" />
                  <div className="pet-identity-info">
                    <div className="pet-name-row">
                      <h3 className="pet-name">{pet.name}</h3>
                      <span className="species-emoji">{pet.species === 'cat' ? '🐈' : '🐕'}</span>
                    </div>
                    <div className="pet-breed-tag">{pet.breed}</div>
                  </div>
                </div>

                <div className="pet-stats-row">
                  <div className="pet-stat-item">
                    <span className="stat-label">Age</span>
                    <span className="stat-val">{pet.ageYears} Years</span>
                  </div>
                  <div className="pet-stat-item">
                    <span className="stat-label">Weight</span>
                    <span className="stat-val">{pet.weightKg} kg</span>
                  </div>
                  <div className="pet-stat-item">
                    <span className="stat-label">Gender</span>
                    <span className="stat-val">{pet.gender}</span>
                  </div>
                </div>

                <div className="pet-dietary-specs">
                  <div className="spec-line">
                    <strong>Dietary Goal:</strong> {pet.dietaryPreference || 'Balanced Standard'}
                  </div>
                  <div className="spec-line">
                    <strong>Allergies:</strong> {pet.allergies || 'None recorded'}
                  </div>
                  <div className="spec-line">
                    <strong>Vaccination:</strong>{' '}
                    <span className="text-green">
                      <CheckCircle2 size={13} className="inline-icon" /> Up to Date
                    </span>
                  </div>
                </div>

                <div className="pet-card-actions">
                  {!isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePet(petId)}
                      className="flex-1"
                    >
                      Select as Active
                    </Button>
                  ) : (
                    <span className="active-selected-tag">Currently Selected</span>
                  )}

                  <button
                    type="button"
                    className="pet-action-icon-btn"
                    onClick={() => openEditModal(pet)}
                    title="Edit details"
                  >
                    <Edit2 size={16} />
                  </button>

                  {pets.length > 1 && (
                    <button
                      type="button"
                      className="pet-action-icon-btn text-danger"
                      onClick={() => {
                        if (window.confirm(`Delete ${pet.name}'s profile?`)) {
                          deletePet(petId);
                        }
                      }}
                      title="Delete profile"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            background: 'var(--card-bg, #fff)',
            borderRadius: '16px',
            border: '2px dashed var(--border-color, #e2e8f0)'
          }}>
            <PawPrint size={44} style={{ color: 'var(--text-muted, #94a3b8)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary, #1e293b)' }}>
              No Pets Registered Yet
            </h3>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Add your dog or cat profile to unlock customized meal plans and vet-approved diets!
            </p>
            <Button variant="primary" icon={Plus} onClick={openAddModal}>
              Register Your First Pet
            </Button>
          </div>
        )}
      </div>

      {/* Vet Recommendations based on Active Pet */}
      {activePet && (
        <section className="pet-recommended-section">
          <div className="section-title-header">
            <div>
              <h2 className="section-main-title">
                Vet-Tailored Diets for {activePet.name} ({activePet.breed})
              </h2>
              <p className="section-subtitle">
                Filtered automatically based on species: {activePet.species.toUpperCase()} & dietary preferences
              </p>
            </div>
            <Link to={`/shop?petType=${activePet.species}`} className="view-more-link">
              View All For {activePet.name} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="recommended-products-grid">
            {recommendedProducts.map((p) => (
              <div key={p.id} className="product-card">
                <Link to={`/products/${p.id}`} className="product-image-wrap">
                  <img src={p.images?.[0]} alt={p.name} className="product-card-img" />
                </Link>
                <div className="product-card-body">
                  <span className="product-brand-tag">{p.brand}</span>
                  <Link to={`/products/${p.id}`} className="product-title-link">
                    <h4 className="product-card-title">{p.name}</h4>
                  </Link>
                  <div className="product-price-row">
                    <span className="current-price">{formatNPR(p.price)}</span>
                    <Link to={`/products/${p.id}`}>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add / Edit Pet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPetId ? `Edit ${formData.name}'s Details` : 'Register a New Pet Companion'}
        subtitle="Provide health and dietary attributes to enable custom nutrition plans."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="pet-modal-form">
          <div className="form-grid-2">
            <Input
              label="Pet's Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Milo, Rocky, Simba"
              required
            />

            <div className="input-field-group">
              <label className="input-label">Species</label>
              <div className="species-select-buttons">
                {['dog', 'cat', 'bird'].map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    className={`species-toggle-btn ${formData.species === sp ? 'active' : ''}`}
                    onClick={() => handleSpeciesChange(sp)}
                  >
                    {sp === 'dog' ? '🐕 Dog' : sp === 'cat' ? '🐈 Cat' : '🦜 Bird'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="input-field-group">
              <label className="input-label">Breed</label>
              <select
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="app-input"
              >
                {(BREEDS_BY_PET[formData.species] || ['Mixed']).map((br) => (
                  <option key={br} value={br}>
                    {br}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Age (Years)"
              type="number"
              step="0.1"
              value={formData.ageYears}
              onChange={(e) => setFormData({ ...formData, ageYears: Number(e.target.value) })}
              required
            />

            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="input-field-group">
              <label className="input-label">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="app-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <Input
              label="Known Food Allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Chicken sensitive, dairy intolerance"
            />
          </div>

          <Input
            label="Dietary Focus / Health Goals"
            value={formData.dietaryPreference}
            onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value })}
            placeholder="e.g. High-Protein, Hairball Control, Joint Support"
          />

          <Input
            label="Avatar Image URL (Optional)"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="modal-actions-right mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPetId ? 'Save Changes' : 'Register Pet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PetProfile;
