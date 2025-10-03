'use client';

import { useThemeColors } from '../hooks/useThemeColors';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    const { getPrimaryButtonStyle } = useThemeColors();

    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    };

    const getVariantStyle = () => {
      switch (variant) {
        case 'primary':
          return getPrimaryButtonStyle(false);
        case 'secondary':
          return {
            background: 'var(--gradient-secondary)',
            color: 'white',
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            border: '2px solid var(--color-primary)',
            color: 'var(--color-primary)',
          };
        default:
          return getPrimaryButtonStyle(false);
      }
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        style={getVariantStyle()}
        disabled={disabled}
        onMouseEnter={(e) => {
          if (variant === 'primary' && !disabled) {
            Object.assign(e.currentTarget.style, getPrimaryButtonStyle(true));
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary' && !disabled) {
            Object.assign(e.currentTarget.style, getPrimaryButtonStyle(false));
          }
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ThemedButton.displayName = 'ThemedButton';

export default ThemedButton;