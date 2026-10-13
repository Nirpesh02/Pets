import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { uploadApi } from '../../../api/uploadApi';
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
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80'],
    dietaryTags: ['High-Protein'],
    variants: [{ weight: '1 kg', price: 1500, stock: 20 }],
    isFeatured: false,
    isBestseller: false,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      productApi.getProductById(id).then((prod) => {
        if (prod) {
          const loadedImages = Array.isArray(prod.images) && prod.images.length > 0
            ? prod.images
            : prod.imageUrl
            ? [prod.imageUrl]
            : [];

          setFormData({
            ...prod,
            images: loadedImages,
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

  const handleFilesUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, WEBP)');
      return;
    }

    try {
      setUploadingImages(true);
      const uploadedUrls = await uploadApi.uploadMultiple(validFiles);
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
      toast.success(`🎉 ${uploadedUrls.length} product image(s) uploaded successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image files.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProductFileInputChange = (e) => {
    handleFilesUpload(e.target.files);
  };

  const handleProductDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
    }));
    toast.info('Image removed from product gallery.');
  };

  const handleSetAsCover = (index) => {
    setFormData((prev) => {
      const currentList = [...(prev.images || [])];
      const [chosen] = currentList.splice(index, 1);
      return { ...prev, images: [chosen, ...currentList] };
    });
    toast.success('Cover photo updated! 🌟');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.images || formData.images.length === 0) {
      toast.error('Please upload at least 1 image for the product.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stockCount: Number(formData.stockCount),
        images: formData.images,
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

            {/* Hidden Multi-file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleProductFileInputChange}
              disabled={uploadingImages}
            />

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleProductDrop}
              style={{
                border: isDragging ? '2px dashed #ea580c' : '2px dashed #cbd5e1',
                backgroundColor: isDragging ? '#fff7ed' : '#f8fafc',
                borderRadius: '12px',
                padding: '24px 16px',
                textAlign: 'center',
                cursor: uploadingImages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#ffedd5',
                  color: '#ea580c',
                  marginBottom: '8px',
                }}
              >
                <Upload size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', marginBottom: '4px' }}>
                {uploadingImages ? 'Uploading images to server...' : 'Click or Drag & Drop to upload images'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                PNG, JPG, JPEG, WEBP • Multiple image selection supported 📸
              </div>
            </div>

            {/* Multiple Images Preview Grid with Cross (X) icon */}
            {formData.images?.length > 0 ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    Uploaded Images ({formData.images.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ea580c',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} /> Add More
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {formData.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: idx === 0 ? '2px solid #ea580c' : '1px solid #e2e8f0',
                        aspectRatio: '1',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                        backgroundColor: '#f1f5f9',
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`Product image ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      {/* Cross (X) Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        title="Delete this image"
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          transition: 'transform 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <X size={14} strokeWidth={2.6} />
                      </button>

                      {/* Main Cover Tag or Set Cover Button */}
                      {idx === 0 ? (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            background: 'rgba(234, 88, 12, 0.92)',
                            color: '#ffffff',
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            textAlign: 'center',
                            padding: '3px 0',
                            textTransform: 'uppercase',
                          }}
                        >
                          ★ Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetAsCover(idx);
                          }}
                          title="Set as main cover image"
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            background: 'rgba(15, 23, 42, 0.75)',
                            color: '#ffffff',
                            fontSize: '0.62rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '3px 0',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Set Cover
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '14px' }}>
                No images uploaded yet. Upload at least 1 image.
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
