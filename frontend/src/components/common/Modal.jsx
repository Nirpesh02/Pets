import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    // Lock body and html
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Non-passive wheel event blocker prevents background page from scrolling on Windows/Chrome
    const handleWheel = (e) => {
      const modalWindow = document.querySelector('.modal-window');
      if (!modalWindow || !modalWindow.contains(e.target)) {
        // Pointer is on backdrop or outside window -> completely freeze wheel
        e.preventDefault();
        return;
      }

      // Check if inside a scrollable container within modal-window
      let el = e.target;
      let scrollableFound = false;

      while (el && el !== document.body && el !== document.documentElement) {
        const canScroll = el.scrollHeight > el.clientHeight;
        const style = window.getComputedStyle(el);
        const isScrollableStyle = style.overflowY === 'auto' || style.overflowY === 'scroll';

        if (canScroll && isScrollableStyle) {
          scrollableFound = true;
          const isUp = e.deltaY < 0;
          const isDown = e.deltaY > 0;
          const atTop = el.scrollTop <= 0;
          const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;

          if ((isUp && atTop) || (isDown && atBottom)) {
            // At top/bottom boundary: prevent scroll chaining to background document!
            e.preventDefault();
          }
          break;
        }

        if (el === modalWindow) break;
        el = el.parentElement;
      }

      if (!scrollableFound) {
        // Element inside modal is not scrollable, prevent bubbling to background
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={closeOnBackdrop ? onClose : undefined}
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div
        className={`modal-window modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="modal-header">
          <div>
            {title && <h3 className="modal-title">{title}</h3>}
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
