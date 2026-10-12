import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last week',
  variant = 'primary',
  subtitle,
}) => {
  const isPositive = trend && !trend.startsWith('-');

  return (
    <div className={`admin-stat-card stat-card-${variant}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {trend && (
          <span className={`stat-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </span>
        )}
        <span className="stat-trend-label">{trend ? trendLabel : subtitle}</span>
      </div>
    </div>
  );
};

export default StatCard;
