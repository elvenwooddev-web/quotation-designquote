'use client';

import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({ title, value, change, trend, icon: Icon, className = '' }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (title.includes('Revenue') || title.includes('Deal Size')) {
        return `₹${val.toLocaleString('en-IN')}`;
      }
      if (title.includes('Growth') || title.includes('Rate')) {
        return `${val.toFixed(1)}%`;
      }
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
        </div>
        {Icon && (
          <div className="text-blue-600">
            <Icon className="h-8 w-8" />
          </div>
        )}
        {change !== undefined && !Icon && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
