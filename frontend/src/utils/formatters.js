export const formatNPR = (amount) => {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getExpiryStatus = (expiryDateString) => {
  if (!expiryDateString) return { status: 'unknown', label: 'No Expiry', color: 'neutral', daysLeft: 999 };
  const today = new Date();
  const expiry = new Date(expiryDateString);
  const diffTime = expiry - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: 'expired',
      label: `Expired (${Math.abs(daysLeft)}d ago)`,
      color: 'rose',
      daysLeft,
      isExpired: true,
      isWarning: true,
    };
  }

  if (daysLeft <= 30) {
    return {
      status: 'expiring_soon',
      label: `Expiring soon (${daysLeft}d left)`,
      color: 'amber',
      daysLeft,
      isExpired: false,
      isWarning: true,
    };
  }

  if (daysLeft <= 90) {
    return {
      status: 'moderate',
      label: `${daysLeft} days freshness left`,
      color: 'sky',
      daysLeft,
      isExpired: false,
      isWarning: false,
    };
  }

  return {
    status: 'fresh',
    label: `Guaranteed Fresh (${daysLeft}d left)`,
    color: 'emerald',
    daysLeft,
    isExpired: false,
    isWarning: false,
  };
};

export const formatWeight = (val) => {
  if (!val) return '';
  if (typeof val === 'number') return `${val} kg`;
  return val;
};
