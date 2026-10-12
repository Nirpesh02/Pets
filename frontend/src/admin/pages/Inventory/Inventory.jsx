import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Package,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { adminApi } from '../../../api/adminApi';
import { productApi } from '../../../api/productApi';
import { formatNPR, formatDate, getExpiryStatus } from '../../../utils/formatters';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';

export const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'low_stock', 'expiring'
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getInventoryWarnings();
      setItems(data);
    } catch {
      toast.error('Could not load inventory warnings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRestock = async (product, addCount) => {
    try {
      const newStock = (product.stockCount || 0) + addCount;
      const pid = product._id || product.id;
      await productApi.updateProduct(pid, {
        stockCount: newStock,
        inStock: newStock > 0,
      });
      toast.success(`Restocked ${product.name} (+${addCount} units). Total now: ${newStock}`);
      fetchInventory();
    } catch {
      toast.error('Restock failed');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'low_stock') {
      return matchesSearch && item.isLowStock;
    }
    if (filterType === 'expiring') {
      return matchesSearch && item.expiryInfo.daysLeft <= 60;
    }
    return matchesSearch;
  });

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory & Expiry Tracking</h1>
          <p className="admin-page-subtitle">
            Proactively monitor batch shelf-life guarantees and low-stock replenishment across Nepal warehouses.
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={fetchInventory}>
          Refresh Report
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="admin-filters-bar">
        <div className="admin-search-form">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search inventory by product name or batch ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="status-tabs-row">
          <button
            type="button"
            className={`status-tab-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Stock Items ({items.length})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${filterType === 'low_stock' ? 'active' : ''}`}
            onClick={() => setFilterType('low_stock')}
          >
            Low Stock Alerts ({items.filter((i) => i.isLowStock).length})
          </button>
          <button
            type="button"
            className={`status-tab-btn ${filterType === 'expiring' ? 'active' : ''}`}
            onClick={() => setFilterType('expiring')}
          >
            Near Expiry / Expired ({items.filter((i) => i.expiryInfo.daysLeft <= 60).length})
          </button>
        </div>
      </div>

      {loading ? (
        <Loader size="md" text="Analyzing inventory..." />
      ) : filteredItems.length === 0 ? (
        <div className="empty-catalog-box">
          <p>No inventory alerts found for this filter!</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Batch Number</th>
                  <th>Expiry Date</th>
                  <th>Freshness Status</th>
                  <th>Stock Balance</th>
                  <th>Quick Restock</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const exp = item.expiryInfo;
                  return (
                    <tr key={item.id} className={item.isLowStock || exp.daysLeft <= 30 ? 'highlight-alert-row' : ''}>
                      <td>
                        <div className="product-row-info">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=100'}
                            alt={item.name}
                            className="product-row-thumb"
                          />
                          <div>
                            <div className="product-row-name">{item.name}</div>
                            <div className="product-row-brand">Brand: {item.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill">{item.category}</span>
                      </td>
                      <td>
                        <code>{item.batchNumber || 'N/A'}</code>
                      </td>
                      <td>{formatDate(item.expiryDate)}</td>
                      <td>
                        <Badge variant={exp.color}>{exp.label}</Badge>
                      </td>
                      <td>
                        <span className={`stock-indicator ${item.isLowStock ? 'stock-low' : 'stock-ok'}`}>
                          {item.stockCount} units
                        </span>
                      </td>
                      <td>
                        <div className="restock-btn-group">
                          <button
                            type="button"
                            className="restock-pill-btn"
                            onClick={() => handleRestock(item, 5)}
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            className="restock-pill-btn"
                            onClick={() => handleRestock(item, 15)}
                          >
                            +15
                          </button>
                          <button
                            type="button"
                            className="restock-pill-btn"
                            onClick={() => handleRestock(item, 50)}
                          >
                            +50
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

export default Inventory;
