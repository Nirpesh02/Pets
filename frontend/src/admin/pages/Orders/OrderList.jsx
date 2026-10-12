import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Printer,
  Calendar,
  CheckCircle,
  Truck,
} from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { formatNPR, formatDate } from '../../../utils/formatters';
import Badge from '../../../components/common/Badge';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';

export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${orderId} updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error('Status update failed');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchTerm ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders & Shipments</h1>
          <p className="admin-page-subtitle">
            Manage customer orders across Kathmandu Valley and nationwide Nepal.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filters-bar">
        <div className="admin-search-form">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="status-tabs-row">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader size="md" text="Loading orders..." />
      ) : filteredOrders.length === 0 ? (
        <div className="empty-catalog-box">
          <p>No orders found matching the filter.</p>
        </div>
      ) : (
        <div className="admin-card">
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order ID & Date</th>
                  <th>Customer Information</th>
                  <th>Items & Pet</th>
                  <th>Destination</th>
                  <th>Payment</th>
                  <th>Total Amount</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <Link to={`/admin/orders/${ord.id}`} className="order-id-link">
                        {ord.id}
                      </Link>
                      <div className="cell-sub">{formatDate(ord.createdAt)}</div>
                      {ord.trackingNumber && (
                        <div className="tracking-sub">Track: {ord.trackingNumber}</div>
                      )}
                    </td>
                    <td>
                      <div className="cell-title">{ord.customerName}</div>
                      <div className="cell-sub">{ord.customerPhone}</div>
                      <div className="cell-sub">{ord.customerEmail}</div>
                    </td>
                    <td>
                      <div className="order-items-summary">
                        {ord.items?.map((it, idx) => (
                          <div key={idx} className="item-line-tiny">
                            {it.name} ({it.variant}) × <strong>{it.quantity}</strong>
                          </div>
                        ))}
                      </div>
                      {ord.petName && <span className="pet-order-tag">For {ord.petName}</span>}
                    </td>
                    <td>
                      <span className="location-tag">{ord.deliveryZone}</span>
                      <div className="cell-sub">{ord.shippingAddress?.street}</div>
                    </td>
                    <td>
                      <span className={`payment-pill ${ord.paymentMethod}`}>
                        {ord.paymentMethod.toUpperCase()}
                      </span>
                      <div className="cell-sub font-medium">{ord.paymentStatus}</div>
                    </td>
                    <td>
                      <div className="price-bold">{formatNPR(ord.totalAmount)}</div>
                      {ord.discount > 0 && <span className="discount-tag-tiny">-Rs.{ord.discount} off</span>}
                    </td>
                    <td>
                      <select
                        className="quick-status-select"
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <Link
                          to={`/admin/orders/${ord.id}`}
                          className="icon-action-btn view-btn"
                          title="View Order Details & Invoice"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
