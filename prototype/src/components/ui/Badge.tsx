import React from 'react';

export interface BadgeProps {
  variant?: 'healthy' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  showDot = true,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {showDot && <span className="badge-dot" />}
      {children}
    </span>
  );
};

