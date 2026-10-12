import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  ArrowRight,
  Plus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import { adminApi } from '../../../api/adminApi';
import { orderApi } from '../../../api/orderApi';
import { formatNPR, formatDate, getExpiryStatus } from '../../../utils/formatters';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${orderId} marked as ${newStatus}`);
      fetchStats();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  if (loading || !stats) {
    return <Loader size="lg" text="Loading Admin Statistics..." fullScreen={false} />;
  }

  // Calculate highest sales day for SVG bar scaling
  const maxDaySales = Math.max(...stats.salesTrend.map((d) => d.sales), 50000);

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Executive Dashboard</h1>
          <p className="admin-page-subtitle">
            Kathmandu Valley operations, daily revenue performance, and inventory health.
          </p>
        </div>
        <div className="admin-header-actions">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchStats}>
            Refresh
          </Button>
          <Link to="/admin/products/new">
            <Button variant="primary" size="sm" icon={Plus}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="admin-stats-grid">
        <StatCard
          title="Total Store Revenue"
          value={formatNPR(stats.totalRevenue)}
          icon={DollarSign}
          trend="+18.4%"
          trendLabel="vs last month"
          variant="primary"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          trend="+12%"
          variant="indigo"
        />
        <StatCard
          title="Pending Action"
          value={stats.pendingOrdersCount}
          icon={Clock}
          subtitle="Orders awaiting dispatch"
          variant="amber"
        />
        <StatCard
          title="Low Stock & Expiry Alerts"
          value={stats.lowStockCount + stats.expiringCount}
          icon={AlertTriangle}
          subtitle={`${stats.lowStockCount} low stock, ${stats.expiringCount} near expiry`}
          variant="rose"
        />
      </div>

      {/* Sales Trend Chart & Urgent Alerts */}
      <div className="admin-dashboard-split-grid">
        {/* Sales Overview Bar Chart */}
        <div className="admin-card revenue-chart-card">
          <div className="admin-card-header">
            <div>
              <h3 className="card-title">Weekly Revenue Trends (NPR)</h3>
              <p className="card-subtitle">Real-time performance across Valley and outside shipments</p>
            </div>
            <div className="chart-badge">
              <TrendingUp size={16} /> 7-Day Performance
            </div>
          </div>

          <div className="custom-sales-chart-wrapper">
            <div className="chart-bars-container">
              {stats.salesTrend.map((d, i) => {
                const heightPct = Math.round((d.sales / maxDaySales) * 100);
                return (
                  <div key={i} className="chart-bar-col">
                    <div className="bar-tooltip">{formatNPR(d.sales)} ({d.orders} orders)</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ height: `${heightPct}%` }} />
                    </div>
                    <span className="bar-label">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Urgent Batch Expiry & Low Stock Box */}
        <div className="admin-card inventory-alert-card">
          <div className="admin-card-header">
            <div>
              <h3 className="card-title">Urgent Inventory Attention</h3>
              <p className="card-subtitle">Batches expiring or items with &lt; 5 units left</p>
            </div>
            <Link to="/admin/inventory" className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="urgent-items-list">
            {stats.expiringProducts.length === 0 && stats.lowStockProducts.length === 0 ? (
              <div className="empty-alert-state">All inventory levels and batches are healthy! ✨</div>
            ) : (
              <>
                {stats.expiringProducts.map((p) => {
                  const exp = getExpiryStatus(p.expiryDate);
                  return (
                    <div key={`exp-${p.id}`} className="urgent-item-row warning-row">
                      <div className="urgent-item-info">
                        <div className="urgent-item-name">{p.name}</div>
                        <div className="urgent-item-meta">
                          Batch: <code>{p.batchNumber}</code> • Expiry: {formatDate(p.expiryDate)}
                        </div>
                      </div>
                      <Badge variant="amber">{exp.label}</Badge>
                    </div>
                  );
                })}

                {stats.lowStockProducts.map((p) => (
                  <div key={`stock-${p.id}`} className="urgent-item-row danger-row">
                    <div className="urgent-item-info">
                      <div className="urgent-item-name">{p.name}</div>
                      <div className="urgent-item-meta">Remaining: Only {p.stockCount} units</div>
                    </div>
                    <Badge variant="rose">Low Stock ({p.stockCount})</Badge>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="admin-card recent-orders-card">
        <div className="admin-card-header">
          <div>
            <h3 className="card-title">Recent Store Orders</h3>
            <p className="card-subtitle">Dispatch orders, update tracking status or print invoices</p>
          </div>
          <Link to="/admin/orders" className="view-all-link">
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <Link to={`/admin/orders/${ord.id}`} className="order-id-link">
                      {ord.id}
                    </Link>
                    <div className="cell-sub">{formatDate(ord.createdAt)}</div>
                  </td>
                  <td>
                    <div className="cell-title">{ord.customerName}</div>
                    <div className="cell-sub">{ord.customerPhone}</div>
                  </td>
                  <td>
                    <span className="location-tag">
                      {ord.deliveryZone.includes('Inside') ? 'Valley (Inside RR)' : ord.deliveryZone}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-pill ${ord.paymentMethod}`}>
                      {ord.paymentMethod.toUpperCase()} ({ord.paymentStatus})
                    </span>
                  </td>
                  <td>
                    <strong>{formatNPR(ord.totalAmount)}</strong>
                  </td>
                  <td>
                    <Badge
                      variant={
                        ord.status === 'delivered'
                          ? 'emerald'
                          : ord.status === 'shipped'
                          ? 'indigo'
                          : ord.status === 'confirmed'
                          ? 'blue'
                          : ord.status === 'cancelled'
                          ? 'rose'
                          : 'amber'
                      }
                      dot
                    >
                      {ord.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <select
                      className="quick-status-select"
                      value={ord.status}
                      onChange={(e) => handleQuickStatusChange(ord.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
