import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  percentage: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'primary',
  size = 'md',
  showLabel = false,
}) => {
  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-secondary-600 mb-1">
          <span>Usage</span>
          <span>{Math.round(clampedPercentage)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-secondary-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx('transition-all duration-300 rounded-full', colors[color])}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};