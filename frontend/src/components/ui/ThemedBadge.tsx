"use client";

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface ThemedBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  count?: number | string;
  className?: string;
  onClick?: () => void;
}

export default function ThemedBadge({
  children,
  variant = 'neutral',
  size = 'sm',
  icon: Icon,
  count,
  className = '',
  onClick
}: ThemedBadgeProps) {
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full touch-manipulation transition-all duration-200';
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs gap-1',
    sm: 'px-2 sm:px-2.5 py-1 text-xs sm:text-sm gap-1 sm:gap-1.5',
    md: 'px-2.5 sm:px-3 py-1.5 text-sm sm:text-base gap-1.5 sm:gap-2',
    lg: 'px-3 sm:px-4 py-2 text-sm sm:text-base gap-2'
  };

  const variantClasses = {
    primary: 'bg-medical-100 text-medical-700 border border-medical-200 hover:bg-medical-200',
    secondary: 'bg-health-100 text-health-700 border border-health-200 hover:bg-health-200',
    success: 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200',
    danger: 'bg-emergency-100 text-emergency-700 border border-emergency-200 hover:bg-emergency-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200',
    neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200'
  };

  const iconSizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6'
  };

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
    ${className}
  `.trim();

  return (
    <span 
      className={combinedClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {Icon && (
        <Icon className={`${iconSizeClasses[size]} flex-shrink-0`} />
      )}
      
      <span className="truncate">
        {children}
      </span>
      
      {count !== undefined && (
        <span className={`
          ml-1 px-1.5 py-0.5 bg-white/80 text-current rounded-full text-xs font-bold flex-shrink-0
          ${size === 'xs' ? 'text-2xs' : 'text-xs'}
        `}>
          {count}
        </span>
      )}
    </span>
  );
}