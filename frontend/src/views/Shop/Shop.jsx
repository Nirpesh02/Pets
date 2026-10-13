import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  Search,
  ShoppingCart,
  X,
  RotateCcw,
  Calendar,
  Check,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { brandApi } from '../../api/brandApi';
import { CATEGORIES, BRANDS, PET_TYPES, getLifeStagesForPet, DIETARY_REQUIREMENTS } from '../../utils/constants';
import { formatNPR, getExpiryStatus } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Sidebar from '../../components/layout/Sidebar';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [availableBrands, setAvailableBrands] = useState(BRANDS);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { addToCart } = useCart();

  // Filter States from URL or defaults
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const petType = searchParams.get('petType') || 'all';
  const lifeStage = searchParams.get('lifeStage') || 'all';
  const brand = searchParams.get('brand') || 'all';
  const sortBy = searchParams.get('sortBy') || 'featured';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStockOnly') === 'true';

  const updateFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (!val || val === 'all' || val === false) {
      next.delete(key);
    } else {
      next.set(key, String(val));
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await productApi.getProducts({
          search,
          category,
          petType,
          lifeStage,
          brand,
          sortBy,
          maxPrice,
          inStockOnly,
        });
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [search, category, petType, lifeStage, brand, sortBy, maxPrice, inStockOnly]);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandDocs = await brandApi.getBrands();
        if (Array.isArray(brandDocs) && brandDocs.length > 0) {
          const names = brandDocs.map((b) => (typeof b === 'string' ? b : b.name));
          setAvailableBrands(Array.from(new Set([...names, ...BRANDS])));
        }
      } catch (err) {
        console.warn('Could not load dynamic brands, using defaults:', err);
      }
    };
    loadBrands();
  }, []);

  const currentLifeStages = getLifeStagesForPet(petType);

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (petType !== 'all' ? 1 : 0) +
    (lifeStage !== 'all' ? 1 : 0) +
    (brand !== 'all' ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const FilterContent = (
    <div className="filter-panel-inner">
      <div className="filter-panel-header">
        <span className="filter-headline">Filter Products</span>
        {activeFilterCount > 0 && (
          <button type="button" className="clear-filters-btn" onClick={clearAllFilters}>
            <RotateCcw size={13} /> Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Pet Species */}
      <div className="filter-group-block">
        <h4 className="filter-group-title">Pet Species</h4>
        <div className="filter-options-list">
          {PET_TYPES.map((pt) => (
            <button
              key={pt.id}
              type="button"
              className={`filter-option-btn ${petType === pt.id ? 'active' : ''}`}
              onClick={() => {
                updateFilter('petType', pt.id);
                if (lifeStage !== 'all') {
                  const targetStages = getLifeStagesForPet(pt.id);
                  if (!targetStages.some((s) => s.id === lifeStage)) {
                    updateFilter('lifeStage', 'all');
                  }
                }
              }}
            >
              <span>{pt.icon} {pt.label}</span>
              {petType === pt.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="filter-group-block">
        <h4 className="filter-group-title">Category</h4>
        <div className="filter-options-list">
          <button
            type="button"
            className={`filter-option-btn ${category === 'all' ? 'active' : ''}`}
            onClick={() => updateFilter('category', 'all')}
          >
            <span>All Categories</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`filter-option-btn ${category === c.id ? 'active' : ''}`}
              onClick={() => updateFilter('category', c.id)}
            >
              <span>{c.icon} {c.label}</span>
              {category === c.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Life Stage */}
      <div className="filter-group-block">
        <h4 className="filter-group-title">
          Life Stage {petType !== 'all' ? `(${PET_TYPES.find((p) => p.id === petType)?.label || petType})` : ''}
        </h4>
        <div className="filter-options-list">
          {currentLifeStages.map((ls) => (
            <button
              key={ls.id}
              type="button"
              className={`filter-option-btn ${lifeStage === ls.id ? 'active' : ''}`}
              onClick={() => updateFilter('lifeStage', ls.id)}
            >
              <span>{ls.icon ? `${ls.icon} ` : ''}{ls.label}</span>
              {lifeStage === ls.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="filter-group-block">
        <h4 className="filter-group-title">Brand</h4>
        <div className="filter-options-list" style={{ maxHeight: '260px', overflowY: 'auto' }}>
          <button
            type="button"
            className={`filter-option-btn ${brand === 'all' ? 'active' : ''}`}
            onClick={() => updateFilter('brand', 'all')}
          >
            <span>All Brands</span>
            {brand === 'all' && <Check size={14} />}
          </button>
          {availableBrands.map((b) => (
            <button
              key={b}
              type="button"
              className={`filter-option-btn ${brand === b ? 'active' : ''}`}
              onClick={() => updateFilter('brand', b)}
            >
              <span>{b}</span>
              {brand === b && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only Switch */}
      <div className="filter-group-block">
        <label className="filter-checkbox-label">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="container shop-page-root">
      {/* Shop Header Bar */}
      <div className="shop-header-banner">
        <div>
          <h1 className="shop-main-title">Pet Nutrition & Care Catalog</h1>
          <p className="shop-subtitle">
            Showing {products.length} genuine pet care products verified for Nepal
          </p>
        </div>

        <div className="shop-top-controls">
          <button
            type="button"
            className="mobile-filter-trigger app-btn btn-outline btn-sm"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Sort By Dropdown */}
          <div className="shop-sort-dropdown">
            <label htmlFor="shop-sort-select" className="sort-label">Sort:</label>
            <select
              id="shop-sort-select"
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="shop-sort-select"
            >
              <option value="featured">Featured & Best Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rating</option>
              <option value="expiry_near">Batch Expiry (Earliest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Desktop Sidebar + Product Cards */}
      <div className="shop-layout-split">
        {/* Desktop Left Sidebar */}
        <aside className="shop-desktop-sidebar">{FilterContent}</aside>

        {/* Mobile Filter Drawer */}
        <Sidebar
          isOpen={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          title="Refine Catalog"
        >
          {FilterContent}
        </Sidebar>

        {/* Product Cards Container */}
        <div className="shop-catalog-content">
          {search && (
            <div className="search-active-pill">
              <span>Showing results for "<strong>{search}</strong>"</span>
              <button type="button" onClick={() => updateFilter('search', '')}>
                <X size={14} />
              </button>
            </div>
          )}

          {loading ? (
            <Loader size="lg" text="Finding best pet nutrition..." />
          ) : products.length === 0 ? (
            <div className="shop-empty-state">
              <div className="empty-state-icon">🐾</div>
              <h3>No matching products found</h3>
              <p>Try clearing some filters or searching with a different brand name.</p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="shop-products-grid">
              {products.map((prod) => {
                const exp = getExpiryStatus(prod.expiryDate);
                const prodId = prod._id || prod.id;
                return (
                  <div key={prodId} className="product-card">
                    <div className="product-card-top-badges">
                      {prod.discountPercent > 0 && (
                        <span className="discount-tag">-{prod.discountPercent}%</span>
                      )}
                      {prod.expiryDate && (
                        <Badge variant={exp.color} size="sm">
                          {exp.label}
                        </Badge>
                      )}
                    </div>

                    <Link to={`/products/${prodId}`} className="product-image-wrap">
                      <img
                        src={prod.images?.[0]}
                        alt={prod.name}
                        className="product-card-img"
                        loading="lazy"
                      />
                    </Link>

                    <div className="product-card-body">
                      <div className="product-card-meta">
                        <span className="product-brand-tag">{prod.brand}</span>
                        <span className="product-type-icon">
                          {prod.petType === 'cat' ? '🐈' : '🐕'}
                        </span>
                      </div>

                      <Link to={`/products/${prodId}`} className="product-title-link">
                        <h3 className="product-card-title">{prod.name}</h3>
                      </Link>

                      {prod.batchNumber && (
                        <div className="batch-micro-info">
                          Batch: <code>{prod.batchNumber}</code>
                        </div>
                      )}

                      {/* Weight Variant Tags */}
                      {prod.variants?.length > 1 && (
                        <div className="variants-chips-row">
                          {prod.variants.map((v, i) => (
                            <span key={i} className="variant-mini-pill">
                              {v.weight}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="product-price-row">
                        <div>
                          <span className="current-price">{formatNPR(prod.price)}</span>
                          {prod.originalPrice > prod.price && (
                            <span className="original-price">{formatNPR(prod.originalPrice)}</span>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={ShoppingCart}
                          onClick={() => addToCart(prod, 1)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
