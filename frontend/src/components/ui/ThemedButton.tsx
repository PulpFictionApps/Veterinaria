'use client';

import { useThemeColors } from '../../hooks/useThemeColors';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
      font-semibold rounded-lg transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-[1.02] active:scale-[0.98] active:transition-none
      shadow
      select-none touch-manipulation
      border-0
      ${fullWidth ? 'w-full' : ''}
      ${variant !== 'outline' && variant !== 'ghost' ? '!text-white' : ''}
    `;
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm sm:px-4 sm:py-2.5',
      md: 'px-4 py-2.5 text-sm sm:px-5 sm:py-3 sm:text-base',
      lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
      xl: 'px-8 py-4 text-lg sm:px-10 sm:py-5 sm:text-xl'
    };

    const getVariantStyle = () => {
        type VariantStyle = {
          background?: string;
          color?: string;
          fallbackClasses?: string;
          focusRingColor?: string;
          border?: string;
        };

        const styles: Record<string, VariantStyle> = {
          primary: {
            background: 'linear-gradient(135deg, rgb(55 65 81), rgb(75 85 99))',
            color: 'white',
            fallbackClasses: 'bg-gray-700 hover:bg-gray-800 text-white',
            focusRingColor: 'focus:ring-gray-500'
          },
          secondary: {
            background: 'linear-gradient(135deg, rgb(75 85 99), rgb(107 114 128))',
            color: 'white',
            fallbackClasses: 'bg-gray-600 hover:bg-gray-700 text-white',
            focusRingColor: 'focus:ring-gray-500'
          },
          danger: {
            background: 'linear-gradient(135deg, rgb(75 85 99), rgb(55 65 81))',
            color: 'white',
            fallbackClasses: 'bg-gray-700 hover:bg-gray-800 text-white',
            focusRingColor: 'focus:ring-gray-500'
          },
          outline: {
            background: 'transparent',
            color: 'rgb(75 85 99)',
            border: '2px solid rgb(75 85 99)',
            fallbackClasses: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50',
            focusRingColor: 'focus:ring-gray-500'
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
    const additionalClasses = variant === 'outline' ? 'border-2 hover:bg-gray-50' : 
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
