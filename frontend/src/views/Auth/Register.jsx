import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePet } from '../../hooks/usePet';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    petName: '',
    species: 'dog',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addPet } = usePet();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRedirectPath = () => {
    if (location.state?.from) {
      if (typeof location.state.from === 'string') {
        return location.state.from;
      }
      if (location.state.from.pathname) {
        return `${location.state.from.pathname}${location.state.from.search || ''}`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        if (formData.petName) {
          await addPet({
            name: formData.petName,
            species: formData.species,
            breed: formData.species === 'cat' ? 'Persian Cat' : 'Golden Retriever',
            ageYears: 1,
            weightKg: 10,
            userId: res.user.id,
          });
        }
        const destination = getRedirectPath();
        navigate(destination || (formData.petName ? '/pet-profile' : '/'), { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-brand-head">
          <div className="auth-logo-circle">
            <PawPrint size={28} className="text-white" />
          </div>
          <h1 className="auth-title">Join PawNepal Family</h1>
          <p className="auth-subtitle">Create your pet parent account for personalized feeding plans</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            prefixIcon={User}
            placeholder="Ram Sharma"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            prefixIcon={Mail}
            placeholder="ram@gmail.com"
            required
          />

          <Input
            label="Mobile Phone (+977)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            prefixIcon={Phone}
            placeholder="98XXXXXXXX"
            required
          />

          <Input
            label="Create Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            prefixIcon={Lock}
            placeholder="At least 6 characters"
            required
          />

          {/* Quick Pet Registration during signup */}
          <div className="auth-pet-field-group">
            <div className="auth-pet-header">
              <PawPrint size={15} className="text-orange-500" />
              <span>Add Your Pet Now (Optional):</span>
            </div>
            <div className="form-grid-2">
              <Input
                name="petName"
                value={formData.petName}
                onChange={handleChange}
                placeholder="Pet's Name (e.g. Milo)"
              />
              <div className="input-field-group">
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="app-input"
                >
                  <option value="dog">🐕 Dog</option>
                  <option value="cat">🐈 Cat</option>
                  <option value="bird">🦜 Bird</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            icon={ArrowRight}
            iconPosition="right"
            className="mt-2"
          >
            Create My Account
          </Button>
        </form>

        <div className="auth-footer-text">
          Already registered?{' '}
          <Link to="/login" state={location.state} className="auth-switch-link">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
