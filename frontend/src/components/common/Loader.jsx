import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 40 : 28;

  if (fullScreen) {
    return (
      <div className="loader-fullscreen-backdrop">
        <div className="loader-box">
          <Loader2 className="animate-spin text-orange-500" size={iconSize} />
          {text && <p className="loader-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loader-inline loader-${size}`}>
      <Loader2 className="animate-spin text-orange-500" size={iconSize} />
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
};

export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) => {
  return (
    <div
      className={`skeleton-box ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export default Loader;
