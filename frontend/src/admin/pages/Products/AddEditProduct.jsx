import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Upload, X, Check, Image as ImageIcon, ChevronDown, Search } from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { uploadApi } from '../../../api/uploadApi';
import { brandApi } from '../../../api/brandApi';
import {
  CATEGORIES,
  BRANDS,
  PET_TYPES,
  LIFE_STAGES,
  LIFE_STAGES_BY_PET,
  getLifeStagesForPet,
  BREEDS_BY_PET,
  DIETARY_REQUIREMENTS,
} from '../../../utils/constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import { useToast } from '../../../context/ToastContext';

export const AddEditProduct = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [brandsList, setBrandsList] = useState(BRANDS);
  const [brandObjects, setBrandObjects] = useState([]);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [showDeleteBrandModal, setShowDeleteBrandModal] = useState(false);
  const [selectedBrandToDelete, setSelectedBrandToDelete] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [savingBrand, setSavingBrand] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState(null);

  // Custom downward-opening brand dropdown state
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const brandDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target)) {
        setBrandDropdownOpen(false);
      }
    };
    if (brandDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [brandDropdownOpen]);

  const [formData, setFormData] = useState({
    name: '',
    brand: BRANDS[0],
    petType: 'dog',
    category: 'food',
    lifeStage: 'adult',
    breedSpecific: 'All Breeds',
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

  const fetchBrands = async () => {
    try {
      const brands = await brandApi.getBrands();
      if (Array.isArray(brands) && brands.length > 0) {
        setBrandObjects(brands);
        const names = brands.map((b) => (typeof b === 'string' ? b : b.name));
        setBrandsList(Array.from(new Set([...names, ...BRANDS])));
      }
    } catch (err) {
      console.warn('Could not fetch brands from DB, using defaults:', err);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handlePetTypeChange = (e) => {
    const newPetType = e.target.value;
    const stages = getLifeStagesForPet(newPetType);
    const isCurrentStageValid = stages.some((s) => s.id === formData.lifeStage);

    setFormData((prev) => ({
      ...prev,
      petType: newPetType,
      lifeStage: isCurrentStageValid ? prev.lifeStage : stages[0]?.id || 'all',
      breedSpecific: 'All Breeds',
    }));
  };

  const handleCreateBrand = async (e) => {
    if (e) e.preventDefault();
    const candidateName = newBrandName.trim();
    if (!candidateName) {
      toast.error('Please enter a valid brand name');
      return;
    }

    // Strict Case-Insensitive Duplicate Check
    const existingDuplicate = brandsList.find(
      (b) => b.trim().toLowerCase() === candidateName.toLowerCase()
    );

    if (existingDuplicate) {
      toast.error(
        `Brand "${existingDuplicate}" already exists! Duplicate brands are not allowed, regardless of uppercase or lowercase letters.`
      );
      return;
    }

    try {
      setSavingBrand(true);
      const res = await brandApi.createBrand({
        name: candidateName,
        petTypes: [formData.petType],
      });

      const brandName = res?.name || candidateName;
      const newDoc = res || { name: brandName, isCustom: true };

      setBrandObjects((prev) => [
        newDoc,
        ...prev.filter(
          (b) => (typeof b === 'string' ? b : b.name).toLowerCase() !== brandName.toLowerCase()
        ),
      ]);
      setBrandsList((prev) => [
        brandName,
        ...prev.filter((b) => b.toLowerCase() !== brandName.toLowerCase()),
      ]);
      setFormData((prev) => ({ ...prev, brand: brandName }));
      toast.success(`🎉 Brand "${brandName}" added and saved in database!`);
      setNewBrandName('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save brand to database';
      toast.error(msg);
    } finally {
      setSavingBrand(false);
    }
  };

  const dynamicBrandsList = brandObjects.filter((b) => b.isCustom);

  const handleDeleteBrand = async (brandToDelete) => {
    if (!brandToDelete) return;

    const brandName = typeof brandToDelete === 'string' ? brandToDelete : brandToDelete.name;

    try {
      setDeletingBrand(brandName);
      await brandApi.deleteBrand(brandName);

      // Remove from state
      const nextBrandObjects = brandObjects.filter((b) => (typeof b === 'string' ? b : b.name) !== brandName);
      const nextBrandsList = brandsList.filter((b) => b !== brandName);

      setBrandObjects(nextBrandObjects);
      setBrandsList(nextBrandsList);

      // If currently selected brand was deleted, select next remaining
      if (formData.brand === brandName) {
        setFormData((prev) => ({ ...prev, brand: nextBrandsList[0] || 'Royal Canin' }));
      }

      // Update remaining dynamic brands in modal
      const remainingDynamic = nextBrandObjects.filter((b) => b.isCustom);
      if (remainingDynamic.length > 0) {
        setSelectedBrandToDelete(remainingDynamic[0].name);
      } else {
        setSelectedBrandToDelete('');
        setShowDeleteBrandModal(false);
      }

      toast.success(`🗑️ Brand "${brandName}" deleted successfully from database!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete brand from database');
    } finally {
      setDeletingBrand(null);
    }
  };

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

  const filteredBrands = brandsList.filter((b) =>
    b.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

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

            {/* Row 1: Product Name (Full Width) */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Royal Canin Golden Retriever Adult"
              />
            </div>

            {/* Row 2: Target Pet & Category */}
            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="input-field-group">
                <label className="input-label">Target Pet</label>
                <select
                  name="petType"
                  value={formData.petType}
                  onChange={handlePetTypeChange}
                  className="app-input"
                >
                  {PET_TYPES.filter((p) => p.id !== 'all').map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.icon} {pt.label}
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
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Brand & Life Stage (Brand shifted down and opens downward) */}
            <div className="form-grid-2" style={{ marginBottom: '16px' }}>
              {/* Brand Field with Custom Downward-Opening Dropdown */}
              <div
                ref={brandDropdownRef}
                className="input-field-group"
                style={{ position: 'relative' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="input-label" style={{ margin: 0 }}>Brand</label>
                  <button
                    type="button"
                    onClick={() => setShowAddBrandModal((prev) => !prev)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary-600, #ea580c)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Plus size={14} /> Add / Manage Brands
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBrandDropdownOpen((prev) => !prev);
                      setBrandSearchQuery('');
                    }}
                    className="app-input"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: '#ffffff',
                      height: '42px',
                      padding: '0 12px',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: formData.brand ? '#0f172a' : '#94a3b8', fontWeight: 500 }}>
                      🏷️ {formData.brand || 'Select a Brand'}
                    </span>
                    <ChevronDown
                      size={16}
                      style={{
                        color: '#64748b',
                        transition: 'transform 0.2s',
                        transform: brandDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>

                  {/* Delete icon on right side of brand dropdown */}
                  <button
                    type="button"
                    title="Select and delete added dynamic brands from database"
                    onClick={() => {
                      const dynamicList = brandObjects.filter((b) => b.isCustom);
                      const matching = dynamicList.find((b) => b.name === formData.brand);
                      setSelectedBrandToDelete(matching ? matching.name : dynamicList[0]?.name || '');
                      setShowDeleteBrandModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      border: '1px solid #fee2e2',
                      background: '#fff1f2',
                      color: '#e11d48',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#ffe4e6';
                      e.currentTarget.style.borderColor = '#fca5a5';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#fff1f2';
                      e.currentTarget.style.borderColor = '#fee2e2';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Custom Downward-Opening Dropdown Menu */}
                {brandDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: '50px',
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.05)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      maxHeight: '260px',
                      overflow: 'hidden',
                      animation: 'fadeIn 0.15s ease',
                    }}
                  >
                    {/* Search Bar */}
                    <div
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #f1f5f9',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Search size={14} color="#94a3b8" />
                      <input
                        type="text"
                        value={brandSearchQuery}
                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                        placeholder={`Search from ${brandsList.length} brands...`}
                        autoFocus
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: '0.85rem',
                          width: '100%',
                          color: '#1e293b',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {brandSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBrandSearchQuery('')}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Scrollable list strictly with overscroll contain */}
                    <div
                      style={{
                        overflowY: 'auto',
                        maxHeight: '210px',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        overscrollBehavior: 'contain',
                      }}
                      onWheel={(e) => {
                        e.stopPropagation();
                        const el = e.currentTarget;
                        const isUp = e.deltaY < 0;
                        const isDown = e.deltaY > 0;
                        if ((isUp && el.scrollTop <= 0) || (isDown && el.scrollTop + el.clientHeight >= el.scrollHeight)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {filteredBrands.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.825rem', color: '#94a3b8' }}>
                          No brands matching "{brandSearchQuery}"
                        </div>
                      ) : (
                        filteredBrands.map((b) => {
                          const isSelected = formData.brand === b;
                          const isCustom = brandObjects.find((doc) => doc.name === b)?.isCustom;

                          return (
                            <div
                              key={b}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, brand: b }));
                                setBrandDropdownOpen(false);
                              }}
                              style={{
                                padding: '7px 10px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: isSelected ? '#ffedd5' : 'transparent',
                                color: isSelected ? '#c2410c' : '#1e293b',
                                fontSize: '0.875rem',
                                fontWeight: isSelected ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'background 0.12s ease',
                              }}
                              onMouseOver={(e) => {
                                if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                              }}
                              onMouseOut={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🏷️ {b}</span>
                                {isCustom && (
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      background: '#dbeafe',
                                      color: '#1e40af',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Custom
                                  </span>
                                )}
                              </div>
                              {isSelected && <Check size={15} color="#ea580c" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Life Stage */}
              <div className="input-field-group">
                <label className="input-label">
                  Life Stage ({PET_TYPES.find((p) => p.id === formData.petType)?.label || formData.petType})
                </label>
                <select
                  name="lifeStage"
                  value={formData.lifeStage}
                  onChange={handleChange}
                  className="app-input"
                >
                  {getLifeStagesForPet(formData.petType).map((ls) => (
                    <option key={ls.id} value={ls.id}>
                      {ls.icon ? `${ls.icon} ` : ''}{ls.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Add & Manage Brands Inline Card */}
            {showAddBrandModal && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  marginBottom: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>🏷️</span>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Add & Manage Brands in Database</strong>
                      <p style={{ margin: 0, fontSize: '0.775rem', color: '#64748b' }}>
                        Add new brands or remove added brands from the database using the delete icon (🗑️) on the right side.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddBrandModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Enter brand name to add (e.g. Taiyo, Vitapol, SmartHeart, Hikari)..."
                    className="app-input"
                    style={{ flex: '1 1 240px' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateBrand();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={savingBrand}
                    icon={Save}
                    onClick={handleCreateBrand}
                  >
                    Save Brand
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddBrandModal(false)}
                  >
                    Close
                  </Button>
                </div>

                {/* Brands List with Delete Icon on the right side */}
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      📋 Database Brands ({brandsList.length}) - Click 🗑️ on the right to delete from DB:
                    </span>
                  </div>
                  <div
                    style={{
                      maxHeight: '190px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#ffffff',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      overscrollBehavior: 'contain',
                    }}
                  >
                    {brandsList.map((b) => {
                      const isSelected = formData.brand === b;
                      const isCustom = brandObjects.find((doc) => doc.name === b)?.isCustom;

                      return (
                        <div
                          key={b}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isSelected ? '#fff7ed' : '#f8fafc',
                            border: isSelected ? '1px solid #fed7aa' : '1px solid transparent',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}
                            onClick={() => setFormData((prev) => ({ ...prev, brand: b }))}
                          >
                            <span style={{ fontSize: '0.875rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#c2410c' : '#1e293b' }}>
                              🏷️ {b}
                            </span>
                            {isCustom && (
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af' }}>
                                Custom Added
                              </span>
                            )}
                            {isSelected && (
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#ffedd5', color: '#c2410c' }}>
                                Selected
                              </span>
                            )}
                          </div>

                          {/* Delete icon on the right side */}
                          <button
                            type="button"
                            title={`Delete "${b}" from database`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBrand(b);
                            }}
                            disabled={deletingBrand === b}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.15s',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.background = '#fee2e2')}
                            onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Row 4: Breed / Species Variety */}
            <div className="input-field-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Breed / Species Variety</label>
              <input
                type="text"
                name="breedSpecific"
                value={formData.breedSpecific || 'All Breeds'}
                onChange={handleChange}
                list="breed-options-list"
                className="app-input"
                placeholder="e.g. All Breeds, Cockatiel, Goldfish, Syrian Hamster..."
              />
              <datalist id="breed-options-list">
                {(BREEDS_BY_PET[formData.petType] || []).map((br) => (
                  <option key={br} value={br} />
                ))}
              </datalist>
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

      {/* Delete Dynamic Brand Modal */}
      <Modal
        isOpen={showDeleteBrandModal}
        onClose={() => setShowDeleteBrandModal(false)}
        title="🗑️ Delete Added Brand"
        subtitle="Select an added dynamic brand from the list below to delete it permanently from the database."
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dynamicBrandsList.length === 0 ? (
            <div
              style={{
                padding: '36px 16px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1.5px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>📭</div>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 600 }}>
                कुनै पनि Dynamic Brand थपिएको छैन (खालि छ)
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b', maxWidth: '340px' }}>
                There are currently no custom added brands in the database. When you add a brand via "+ Add Brand", it will appear here.
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowDeleteBrandModal(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="input-field-group">
                <label className="input-label" style={{ fontWeight: 600 }}>
                  Select Dynamic Brand to Delete:
                </label>
                <select
                  value={selectedBrandToDelete}
                  onChange={(e) => setSelectedBrandToDelete(e.target.value)}
                  className="app-input"
                  style={{ fontSize: '0.95rem', padding: '10px 12px' }}
                >
                  {dynamicBrandsList.map((b) => (
                    <option key={b._id || b.name} value={b.name}>
                      🏷️ {b.name} (Added Brand)
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#991b1b', lineHeight: 1.4 }}>
                  Deleting brand <strong>"{selectedBrandToDelete}"</strong> will permanently remove it from MongoDB and from catalog filters.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowDeleteBrandModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  icon={Trash2}
                  isLoading={deletingBrand === selectedBrandToDelete}
                  disabled={!selectedBrandToDelete}
                  onClick={() => handleDeleteBrand(selectedBrandToDelete)}
                >
                  Delete Brand
                </Button>
              </div>

              {/* Dynamic Brands List */}
              <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                  Added Dynamic Brands ({dynamicBrandsList.length}):
                </span>
                <div
                  style={{
                    maxHeight: '160px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {dynamicBrandsList.map((b) => (
                    <div
                      key={b._id || b.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: selectedBrandToDelete === b.name ? '#fee2e2' : '#f8fafc',
                        border: selectedBrandToDelete === b.name ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => setSelectedBrandToDelete(b.name)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e293b' }}>
                          🏷️ {b.name}
                        </span>
                        {selectedBrandToDelete === b.name && (
                          <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
                            Selected
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        title={`Delete ${b.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBrand(b.name);
                        }}
                        disabled={deletingBrand === b.name}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e11d48',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddEditProduct;
