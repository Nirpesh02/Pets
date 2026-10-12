import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { productApi } from '../../../api/productApi';
import { formatNPR, formatDate, getExpiryStatus } from '../../../utils/formatters';
import { CATEGORIES } from '../../../utils/constants';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts({
        search: searchTerm,
        category: selectedCategory,
      });
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove product: "${name}"?`)) {
      try {
        await productApi.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
        toast.success(`Removed "${name}" from store catalog.`);
      } catch {
        toast.error('Could not delete product.');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products & Batch Inventory</h1>
          <p className="admin-page-subtitle">
            Manage product catalog, nutritional specifications, batch expiry tracking, and stocks.
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button variant="primary" icon={Plus}>
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by product name, brand, or batch number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="admin-category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      {loading ? (
        <Loader size="md" text="Loading product catalog..." />
      ) : products.length === 0 ? (
        <div className="empty-catalog-box">
          <p>No products found matching your search.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>Category / Pet</th>
                  <th>Base Price</th>
                  <th>Stock Units</th>
                  <th>Batch & Expiry Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const expInfo = getExpiryStatus(p.expiryDate);
                  const pid = p._id || p.id;
                  return (
                    <tr key={pid}>
                      <td>
                        <div className="product-row-info">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100'}
                            alt={p.name}
                            className="product-row-thumb"
                          />
                          <div>
                            <div className="product-row-name">{p.name}</div>
                            <div className="product-row-brand">Brand: {p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill">{p.category}</span>
                        <div className="cell-sub">{p.petType?.toUpperCase()}</div>
                      </td>
                      <td>
                        <strong>{formatNPR(p.price)}</strong>
                        {p.variants?.length > 1 && (
                          <div className="cell-sub">{p.variants.length} variations</div>
                        )}
                      </td>
                      <td>
                        <span className={`stock-indicator ${p.stockCount <= 5 ? 'stock-low' : 'stock-ok'}`}>
                          {p.stockCount} in stock
                        </span>
                      </td>
                      <td>
                        {p.batchNumber ? (
                          <div>
                            <div className="batch-code">Batch: {p.batchNumber}</div>
                            <div className="expiry-date-tag">
                              <Badge
                                variant={expInfo.color}
                                size="sm"
                              >
                                {expInfo.label}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted">N/A (Non-perishable)</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons-group">
                          <Link to={`/admin/products/edit/${pid}`} className="icon-action-btn edit-btn" title="Edit">
                            <Edit size={16} />
                          </Link>
                          <button
                            type="button"
                            className="icon-action-btn delete-btn"
                            onClick={() => handleDelete(pid, p.name)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
