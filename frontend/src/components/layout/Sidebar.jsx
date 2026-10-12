import React from 'react';
import { X, Filter } from 'lucide-react';

export const Sidebar = ({
  isOpen,
  onClose,
  title = 'Filters',
  children,
  className = '',
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''} ${className}`}>
        <div className="sidebar-header">
          <div className="sidebar-title-wrap">
            <Filter size={18} />
            <h3 className="sidebar-title">{title}</h3>
          </div>
          {onClose && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-content">{children}</div>
      </aside>
    </>
  );
};

export default Sidebar;
