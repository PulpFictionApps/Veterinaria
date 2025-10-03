'use client';

import { useThemeColors } from '../../hooks/useThemeColors';
import { ReactNode } from 'react';

interface ThemedCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'medical' | 'health' | 'emergency';
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ThemedCard({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  shadow = 'md'
}: ThemedCardProps) {
  const { getCardStyle } = useThemeColors();
  
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  const variantClasses = {
    default: 'border border-gray-200',
    medical: 'border border-medical-200 bg-gradient-to-br from-medical-50/50 to-white',
    health: 'border border-health-200 bg-gradient-to-br from-health-50/50 to-white',
    emergency: 'border border-emergency-200 bg-gradient-to-br from-emergency-50/50 to-white'
  };

  return (
    <div 
      className={`
        rounded-2xl 
        ${paddingClasses[padding]} 
        ${shadowClasses[shadow]} 
        ${variantClasses[variant]}
        transition-all duration-300 
        sm:hover:shadow-xl 
        sm:hover:-translate-y-1 
        group
        touch-manipulation
        ${className}
      `}
      style={variant === 'default' ? getCardStyle() : {}}
    >
      {children}
    </div>
  );
}