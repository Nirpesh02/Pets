import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Truck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { orderApi } from '../../../api/orderApi';
import { formatNPR, formatDate } from '../../../utils/formatters';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrderById(id);
      setOrder(data);
    } catch {
      toast.error('Could not load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updated = await orderApi.updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      toast.success(`Order status changed to ${newStatus}`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !order) {
    return <Loader size="lg" text="Loading Order details..." />;
  }

  return (
    <div className="admin-page-container printable-area">
      {/* Header */}
      <div className="admin-page-header no-print">
        <div>
          <Link to="/admin/orders" className="back-breadcrumb-link">
            <ArrowLeft size={16} /> Back to All Orders
          </Link>
          <div className="order-title-row">
            <h1 className="admin-page-title">Order #{order.id}</h1>
            <Badge
              variant={
                order.status === 'delivered'
                  ? 'emerald'
                  : order.status === 'shipped'
                  ? 'indigo'
                  : order.status === 'confirmed'
                  ? 'blue'
                  : 'amber'
              }
            >
              {order.status.toUpperCase()}
            </Badge>
          </div>
          <p className="admin-page-subtitle">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="admin-header-actions">
          <Button variant="outline" icon={Printer} onClick={handlePrint}>
            Print Invoice
          </Button>

          <select
            className="app-select font-medium"
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoice Printable View */}
      <div className="invoice-container admin-card">
        <div className="invoice-header">
          <div className="invoice-brand">
            <h2>PawNepal Animal Nutrition & Care</h2>
            <p>VAT / PAN: 609812450 • Kathmandu, Nepal</p>
            <p>Phone: +977 9841234567 • Email: support@pawnepal.com</p>
          </div>
          <div className="invoice-meta text-right">
            <h3>TAX INVOICE / RECEIPT</h3>
            <p><strong>Invoice No:</strong> {order.id}</p>
            <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
            <p><strong>Tracking No:</strong> {order.trackingNumber}</p>
            <p><strong>Payment Mode:</strong> {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</p>
          </div>
        </div>

        <hr className="invoice-divider" />

        {/* Customer & Delivery Information */}
        <div className="invoice-customer-grid">
          <div className="info-box">
            <h4>Billed & Delivered To:</h4>
            <p className="font-bold">{order.customerName}</p>
            <p><Phone size={14} className="inline-icon" /> {order.customerPhone}</p>
            <p><Mail size={14} className="inline-icon" /> {order.customerEmail}</p>
            <p><MapPin size={14} className="inline-icon" /> {order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
            {order.shippingAddress?.landmark && (
              <p className="text-muted">Landmark: {order.shippingAddress.landmark}</p>
            )}
          </div>

          <div className="info-box">
            <h4>Delivery Logistics:</h4>
            <p><strong>Zone:</strong> {order.deliveryZone}</p>
            <p><strong>Handling:</strong> Pet Care Standard Safe Transit</p>
            {order.petName && (
              <p><strong>Pet Recipient:</strong> {order.petName}</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="invoice-table-wrap">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Variation / Size</th>
                <th className="text-right">Unit Price</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Total (NPR)</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((it, i) => (
                <tr key={i}>
                  <td>
                    <div className="font-medium">{it.name}</div>
                  </td>
                  <td>{it.variant || 'Standard'}</td>
                  <td className="text-right">{formatNPR(it.price)}</td>
                  <td className="text-center">{it.quantity}</td>
                  <td className="text-right font-medium">
                    {formatNPR(it.price * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="invoice-totals-row">
          <div className="invoice-note">
            <p>Thank you for shopping with PawNepal!</p>
            <p className="text-sm text-muted">
              For return inquiries or feeding advice, contact our veterinary helpline within 48 hours.
            </p>
          </div>

          <div className="totals-calc-table">
            <div className="calc-row">
              <span>Subtotal:</span>
              <span>{formatNPR(order.subtotal)}</span>
            </div>
            <div className="calc-row">
              <span>Shipping Fee:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : formatNPR(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="calc-row text-green">
                <span>Promo Discount ({order.promoCode}):</span>
                <span>-{formatNPR(order.discount)}</span>
              </div>
            )}
            <div className="calc-row grand-total">
              <span>Grand Total:</span>
              <span>{formatNPR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
