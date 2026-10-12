import React, { useState, useEffect } from 'react';
import {
  Users,
  PawPrint,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Ban,
  CheckCircle2,
  Trash2,
  Crown,
  ShieldCheck,
  Shield,
  User,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import { adminApi } from '../../../api/adminApi';
import { petProfileApi } from '../../../api/petProfileApi';
import { formatNPR, formatDate } from '../../../utils/formatters';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../hooks/useAuth';

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [custData, petsData] = await Promise.all([
        adminApi.getCustomers(),
        petProfileApi.getPetProfiles(),
      ]);
      setCustomers(custData);
      setPets(petsData);
    } catch {
      toast.error('Failed to load user and customer directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (cust, newRole) => {
    const custId = cust._id || cust.id;
    const isHiring = newRole === 'admin';
    const confirmMsg = isHiring
      ? `Hire "${cust.name}" (${cust.email}) as Store Administrator?\n\nThey will be granted administrative access to manage products, view orders, and manage inventory.`
      : `Revoke administrator access for "${cust.name}" (${cust.email}) and demote back to Customer?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await adminApi.changeUserRole(custId, newRole);
      setCustomers((prev) =>
        prev.map((c) =>
          (c._id || c.id) === custId ? { ...c, role: newRole } : c
        )
      );
      toast.success(
        isHiring
          ? `🎉 "${cust.name}" has been hired as Store Administrator!`
          : `Privileges revoked. "${cust.name}" is now a Customer.`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleBlock = async (cust) => {
    const custId = cust._id || cust.id;
    const willBlock = !cust.isBlocked;
    const accountType = cust.role === 'admin' ? 'Administrator' : 'Customer';
    const confirmMsg = willBlock
      ? `Are you sure you want to block ${accountType} "${cust.name}" (${cust.email})?\n\nThey will be prevented from logging in.`
      : `Unblock ${accountType} "${cust.name}" (${cust.email})?\n\nThey will be able to log in again.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await adminApi.toggleBlockCustomer(custId);
      setCustomers((prev) =>
        prev.map((c) =>
          (c._id || c.id) === custId ? { ...c, isBlocked: willBlock } : c
        )
      );
      toast.success(
        willBlock
          ? `${accountType} "${cust.name}" has been blocked. They cannot log in.`
          : `${accountType} "${cust.name}" unblocked successfully. Access restored.`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDelete = async (cust) => {
    const custId = cust._id || cust.id;
    const accountType = cust.role === 'admin' ? 'Administrator' : 'Customer';
    const confirmMsg = `Are you sure you want to permanently delete ${accountType} "${cust.name}" (${cust.email})?\n\nTheir record will be deleted from the database.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await adminApi.deleteCustomer(custId);
      setCustomers((prev) => prev.filter((c) => (c._id || c.id) !== custId));
      toast.success(`${accountType} "${cust.name}" deleted successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users, Staff & Registered Pets</h1>
          <p className="admin-page-subtitle">
            Manage customers, hire new administrators, revoke staff roles, control account access, and oversee registered pet companions.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader size="md" text="Loading user accounts..." />
      ) : customers.length === 0 ? (
        <div className="admin-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3>No Accounts Found</h3>
          <p>Accounts created in the store will automatically appear here.</p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive-wrapper customers-table-desktop">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>User & Access</th>
                  <th style={{ minWidth: '200px' }}>Contact & Address</th>
                  <th style={{ minWidth: '120px' }}>Orders & Spend</th>
                  <th style={{ minWidth: '140px' }}>Registered Pets</th>
                  <th style={{ minWidth: '95px' }}>Status</th>
                  <th style={{ minWidth: '170px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => {
                  const custId = cust._id || cust.id;
                  const customerPets = pets.filter((p) => p.user === custId || p.userId === custId);
                  const isSuper = Boolean(cust.isSuperAdmin || cust.email === 'admin@pawnepal.com');
                  const isSelf = currentUser && (
                    String(custId) === String(currentUser.id || currentUser._id) ||
                    cust.email === currentUser.email
                  );
                  const isHiredAdmin = cust.role === 'admin' && !isSuper;

                  return (
                    <tr key={custId}>
                      {/* User & Access */}
                      <td>
                        <div className="customer-cell-wrap">
                          <img
                            src={cust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={cust.name}
                            className="cust-table-avatar"
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                              <span className="cust-table-name">{cust.name}</span>
                              {isSuper ? (
                                <span className="role-pill super-admin" title="Super Administrator (Owner)">
                                  <Crown size={11} /> Super Admin
                                </span>
                              ) : isHiredAdmin ? (
                                <span className="role-pill hired-admin" title="Staff Administrator">
                                  <ShieldCheck size={11} /> Admin
                                </span>
                              ) : (
                                <span className="role-pill customer" title="Regular Customer">
                                  <PawPrint size={11} /> Customer
                                </span>
                              )}
                            </div>
                            <div className="cust-table-joined">Joined {formatDate(cust.createdAt)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Address */}
                      <td>
                        {cust.phone && (
                          <div className="contact-line-sub">
                            <Phone size={12} /> {cust.phone}
                          </div>
                        )}
                        <div className="contact-line-sub">
                          <Mail size={12} /> {cust.email}
                        </div>
                        {cust.address && (
                          <div className="contact-line-sub" style={{ color: '#475569' }}>
                            <MapPin size={12} /> {cust.address}
                          </div>
                        )}
                      </td>

                      {/* Orders & Spend */}
                      <td>
                        <strong className="text-primary" style={{ display: 'block', fontSize: '0.9rem' }}>
                          {formatNPR(cust.totalSpent || 0)}
                        </strong>
                        <span className="order-count-pill">{cust.totalOrders || 0} orders</span>
                      </td>

                      {/* Registered Pets */}
                      <td>
                        <div className="customer-pets-avatars-row">
                          {customerPets.length > 0 ? (
                            customerPets.map((p) => (
                              <div key={p._id || p.id} className="pet-mini-badge" title={`${p.name} (${p.breed || 'Pet'})`}>
                                <img src={p.avatar} alt={p.name} />
                                <span>{p.name}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>No pets</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {cust.isBlocked ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Ban size={11} /> Blocked
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <CheckCircle2 size={11} /> Active
                          </span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {isSuper ? (
                          <span className="protected-admin-pill" title="Super Administrator cannot be modified, blocked or deleted">
                            <Shield size={13} /> Protected (Main Admin)
                          </span>
                        ) : isSelf ? (
                          <span className="self-account-pill" title="Your currently logged in account">
                            <User size={13} /> You (Active Account)
                          </span>
                        ) : (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {/* Role Promotion/Demotion Button */}
                            {cust.role === 'customer' ? (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(cust, 'admin')}
                                className="btn-hire-admin"
                                title="Hire as Admin (grant administrative privileges)"
                              >
                                <UserCheck size={13} /> Hire as Admin 🎖️
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(cust, 'customer')}
                                className="btn-revoke-admin"
                                title="Demote back to regular Customer"
                              >
                                <UserMinus size={13} /> Revoke Admin
                              </button>
                            )}

                            {/* Block / Unblock Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(cust)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: cust.isBlocked ? '1px solid #16a34a' : '1px solid #f97316',
                                background: cust.isBlocked ? '#f0fdf4' : '#fff7ed',
                                color: cust.isBlocked ? '#15803d' : '#c2410c',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease',
                              }}
                              title={cust.isBlocked ? 'Unblock account' : 'Block account from logging in'}
                            >
                              {cust.isBlocked ? (
                                <>
                                  <CheckCircle2 size={13} /> Unblock
                                </>
                              ) : (
                                <>
                                  <Ban size={13} /> Block
                                </>
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(cust)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #ef4444',
                                background: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease',
                              }}
                              title="Delete account permanently"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Customer Cards View (Visible on screens <= 768px) */}
          <div className="customers-mobile-cards-view">
            {customers.map((cust) => {
              const custId = cust._id || cust.id;
              const customerPets = pets.filter((p) => p.user === custId || p.userId === custId);
              const isSuper = Boolean(cust.isSuperAdmin || cust.email === 'admin@pawnepal.com');
              const isSelf = currentUser && (
                String(custId) === String(currentUser.id || currentUser._id) ||
                cust.email === currentUser.email
              );
              const isHiredAdmin = cust.role === 'admin' && !isSuper;

              return (
                <div key={custId} className="customer-mobile-card">
                  <div className="customer-mobile-card-header">
                    <img
                      src={cust.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={cust.name}
                      className="cust-table-avatar"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="cust-table-name">{cust.name}</div>
                      <div className="cust-table-joined">Joined {formatDate(cust.createdAt)}</div>
                    </div>
                    {isSuper ? (
                      <span className="role-pill super-admin"><Crown size={12} /> Super Admin</span>
                    ) : isHiredAdmin ? (
                      <span className="role-pill hired-admin"><ShieldCheck size={12} /> Admin</span>
                    ) : (
                      <span className="role-pill customer"><PawPrint size={12} /> Customer</span>
                    )}
                  </div>

                  <div className="customer-mobile-card-body">
                    <div className="contact-line-sub">
                      <Phone size={13} /> {cust.phone || 'No phone'}
                    </div>
                    <div className="contact-line-sub">
                      <Mail size={13} /> {cust.email}
                    </div>
                    {cust.address && (
                      <div className="contact-line-sub">
                        <MapPin size={13} /> {cust.address}
                      </div>
                    )}
                  </div>

                  <div className="customer-mobile-card-stats">
                    <div>
                      <span className="cust-stat-label">Spent:</span>
                      <strong className="text-primary">{formatNPR(cust.totalSpent || 0)}</strong>
                    </div>
                    <div>
                      <span className="cust-stat-label">Orders:</span>
                      <span className="order-count-pill">{cust.totalOrders || 0}</span>
                    </div>
                    <div>
                      <span className="cust-stat-label">Status:</span>
                      {cust.isBlocked ? (
                        <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.75rem' }}><Ban size={11} /> Blocked</span>
                      ) : (
                        <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.75rem' }}><CheckCircle2 size={11} /> Active</span>
                      )}
                    </div>
                  </div>

                  {customerPets.length > 0 && (
                    <div className="customer-mobile-pets-row">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pets:</span>
                      {customerPets.map((p) => (
                        <div key={p._id || p.id} className="pet-mini-badge" title={`${p.name} (${p.breed})`}>
                          <img src={p.avatar} alt={p.name} />
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="customer-mobile-card-actions">
                    {isSuper ? (
                      <span className="protected-admin-pill"><Shield size={13} /> Super Administrator</span>
                    ) : isSelf ? (
                      <span className="self-account-pill"><User size={13} /> You (Active Account)</span>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                        {cust.role === 'customer' ? (
                          <button
                            type="button"
                            onClick={() => handleRoleChange(cust, 'admin')}
                            className="btn-hire-admin"
                            style={{ flex: 1, justifyContent: 'center' }}
                          >
                            <UserCheck size={13} /> Hire as Admin
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRoleChange(cust, 'customer')}
                            className="btn-revoke-admin"
                            style={{ flex: 1, justifyContent: 'center' }}
                          >
                            <UserMinus size={13} /> Revoke Admin
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(cust)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: cust.isBlocked ? '1px solid #16a34a' : '1px solid #f97316',
                            background: cust.isBlocked ? '#f0fdf4' : '#fff7ed',
                            color: cust.isBlocked ? '#15803d' : '#c2410c',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {cust.isBlocked ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                          {cust.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cust)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ef4444',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
