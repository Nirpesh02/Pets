import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { CATEGORIES, BRANDS, PET_TYPES, LIFE_STAGES, DIETARY_REQUIREMENTS } from '../../../utils/constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useToast } from '../../../context/ToastContext';

export const AddEditProduct = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    brand: BRANDS[0],
    petType: 'dog',
    category: 'food',
    lifeStage: 'adult',
    price: 1500,
    originalPrice: 1800,
    stockCount: 20,
    batchNumber: 'BATCH-2026-NP01',
    expiryDate: '2027-06-30',
    shortDesc: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
    dietaryTags: ['High-Protein'],
    variants: [{ weight: '1 kg', price: 1500, stock: 20 }],
    isFeatured: false,
    isBestseller: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      productApi.getProductById(id).then((prod) => {
        if (prod) {
          setFormData({
            ...prod,
            imageUrl: prod.images?.[0] || '',
            variants: prod.variants?.length ? prod.variants : [{ weight: 'Standard', price: prod.price, stock: prod.stockCount }],
          });
        }
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { weight: '3 kg', price: 4000, stock: 10 }],
    }));
  };

  const handleVariantChange = (index, field, val) => {
    setFormData((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, variants: next };
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const toggleDietaryTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.dietaryTags.includes(tag);
      return {
        ...prev,
        dietaryTags: exists
          ? prev.dietaryTags.filter((t) => t !== tag)
          : [...prev.dietaryTags, tag],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stockCount: Number(formData.stockCount),
        images: [formData.imageUrl],
      };

      if (isEdit) {
        await productApi.updateProduct(id, payload);
        toast.success('Product updated successfully!');
      } else {
        await productApi.createProduct(payload);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <Link to="/admin/products" className="back-breadcrumb-link">
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <h1 className="admin-page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="admin-page-subtitle">Configure specifications, pricing, and batch details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-layout">
        <div className="admin-form-main-col">
          {/* Basic Details Card */}
          <div className="admin-card">
            <h3 className="card-section-title">Product Information</h3>
            <div className="form-grid-2">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Royal Canin Golden Retriever Adult"
              />

              <div className="input-field-group">
                <label className="input-label">Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="app-input"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="input-field-group">
                <label className="input-label">Target Pet</label>
                <select
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  className="app-input"
                >
                  {PET_TYPES.filter((p) => p.id !== 'all').map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="app-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Life Stage</label>
                <select
                  name="lifeStage"
                  value={formData.lifeStage}
                  onChange={handleChange}
                  className="app-input"
                >
                  {LIFE_STAGES.map((ls) => (
                    <option key={ls.id} value={ls.id}>
                      {ls.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Short Summary"
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleChange}
              placeholder="Highlight benefits (e.g. Grain-free for sensitive digestion in Kathmandu)"
            />

            <Input
              label="Detailed Product Description & Nutritional Analysis"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Full ingredients, vitamins, guaranteed analysis..."
            />
          </div>

          {/* Variations & Weight Packaging */}
          <div className="admin-card">
            <div className="card-header-flex">
              <div>
                <h3 className="card-section-title">Weight Variants & Pricing</h3>
                <p className="card-sub">Different bag sizes (e.g. 1kg, 3kg, 12kg) with respective prices.</p>
              </div>
              <Button type="button" variant="outline" size="sm" icon={Plus} onClick={handleAddVariant}>
                Add Variant
              </Button>
            </div>

            <div className="variants-list">
              {formData.variants.map((v, i) => (
                <div key={i} className="variant-row-item">
                  <Input
                    label="Weight / Size"
                    value={v.weight}
                    onChange={(e) => handleVariantChange(i, 'weight', e.target.value)}
                    placeholder="e.g. 3 kg"
                  />
                  <Input
                    label="Price (Rs.)"
                    type="number"
                    value={v.price}
                    onChange={(e) => handleVariantChange(i, 'price', Number(e.target.value))}
                  />
                  <Input
                    label="Stock Units"
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(i, 'stock', Number(e.target.value))}
                  />
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      className="delete-variant-btn"
                      onClick={() => handleRemoveVariant(i)}
                      title="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Requirements Tags */}
          <div className="admin-card">
            <h3 className="card-section-title">Dietary Tags</h3>
            <div className="dietary-tags-selector">
              {DIETARY_REQUIREMENTS.map((tag) => {
                const isSelected = formData.dietaryTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-toggle-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleDietaryTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="admin-form-side-col">
          {/* Batch & Expiry Card */}
          <div className="admin-card">
            <h3 className="card-section-title">Batch & Expiry Tracking</h3>
            <Input
              label="Batch Number"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              placeholder="e.g. BATCH-2026-NP01"
            />
            <Input
              label="Expiry Date"
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              helperText="Used for automated freshness and expiry warning badges"
            />
            <Input
              label="Total Base Inventory Units"
              type="number"
              name="stockCount"
              value={formData.stockCount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Pricing & Media Card */}
          <div className="admin-card">
            <h3 className="card-section-title">Media & Display</h3>
            <Input
              label="Product Image URL"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              prefixIcon={ImageIcon}
            />

            {formData.imageUrl && (
              <div className="image-preview-box">
                <img src={formData.imageUrl} alt="Preview" className="image-preview" />
              </div>
            )}

            <div className="feature-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                <span>Show in Featured Section</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={formData.isBestseller}
                  onChange={handleChange}
                />
                <span>Tag as Bestseller</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              icon={Save}
              isLoading={saving}
              className="mt-4"
            >
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
