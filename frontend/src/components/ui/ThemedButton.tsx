'use client';

import { useThemeColors } from '../../hooks/useThemeColors';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'medical' | 'health' | 'emergency' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    className = '', 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const { getPrimaryButtonStyle } = useThemeColors();

    const baseClasses = `
      font-semibold rounded-xl transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95 active:transition-none
      shadow-md hover:shadow-lg
      select-none touch-manipulation
      ${fullWidth ? 'w-full' : ''}
      sm:hover:scale-105 hover:scale-100
      ${variant !== 'outline' && variant !== 'ghost' ? '!text-white' : ''}
    `;
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm sm:px-4 sm:py-2.5',
      md: 'px-4 py-2.5 text-sm sm:px-5 sm:py-3 sm:text-base',
      lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
      xl: 'px-8 py-4 text-lg sm:px-10 sm:py-5 sm:text-xl'
    };

    const getVariantStyle = () => {
      const styles: Record<string, any> = {
        primary: {
          background: 'var(--gradient-primary)',
          color: 'white',
          fallbackClasses: 'bg-primary text-white hover:opacity-90',
          focusRingColor: 'focus:ring-blue-500'
        },
        secondary: {
          background: 'var(--gradient-secondary)',
          color: 'white',
          fallbackClasses: 'bg-secondary text-white hover:opacity-90',
          focusRingColor: 'focus:ring-green-500'
        },
        medical: {
          background: 'var(--gradient-primary)',
          color: 'white',
          fallbackClasses: 'bg-primary text-white hover:opacity-90',
          focusRingColor: 'focus:ring-blue-500'
        },
        health: {
          background: 'var(--gradient-secondary)',
          color: 'white',
          fallbackClasses: 'bg-secondary text-white hover:opacity-90',
          focusRingColor: 'focus:ring-green-500'
        },
        emergency: {
          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
          color: 'white',
          fallbackClasses: 'bg-red-600 hover:bg-red-700 text-white',
          focusRingColor: 'focus:ring-red-500'
        },
        outline: {
          background: 'transparent',
          color: 'var(--primary-500)',
          border: '2px solid var(--primary-500)',
          fallbackClasses: 'border-2 border-primary text-primary hover:bg-blue-50',
          focusRingColor: 'focus:ring-blue-500'
        },
        ghost: {
          background: 'transparent',
          color: '#374151',
          fallbackClasses: 'text-gray-700 hover:bg-gray-100',
          focusRingColor: 'focus:ring-gray-500'
        }
      };
      return styles[variant] || styles.primary;
    };

    const variantStyle = getVariantStyle();
    const additionalClasses = variant === 'outline' ? 'border-2 hover:bg-blue-50' : 
                              variant === 'ghost' ? 'hover:bg-gray-100' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseClasses} 
          ${sizeClasses[size]} 
          ${variantStyle.focusRingColor}
          ${variantStyle.fallbackClasses || ''}
          ${additionalClasses}
          ${variant !== 'outline' && variant !== 'ghost' ? `themed-button-${variant}` : ''}
          ${className}
        `}
        style={variant !== 'outline' && variant !== 'ghost' ? {
          background: variantStyle.background,
          color: 'white',
          border: 'none'
        } : {
          border: variantStyle.border || 'none',
          color: variantStyle.color,
          background: variantStyle.background
        }}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          )}
          {Icon && iconPosition === 'left' && !loading && (
            <Icon className="w-4 h-4" />
          )}
          {children}
          {Icon && iconPosition === 'right' && !loading && (
            <Icon className="w-4 h-4" />
          )}
        </div>
      </button>
    );
  }
);

ThemedButton.displayName = 'ThemedButton';

export default ThemedButton;