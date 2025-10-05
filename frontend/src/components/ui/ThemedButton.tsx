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
      font-semibold rounded-xl transition-all duration-300 
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95 active:transition-none
      shadow-lg hover:shadow-xl
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
          background: 'linear-gradient(135deg, #EC4899, #BE185D)',
          color: 'white',
          fallbackClasses: 'bg-medical-600 hover:bg-medical-700 text-white !text-white',
          focusRingColor: 'focus:ring-medical-500'
        },
        secondary: {
          background: 'linear-gradient(135deg, #F9A8D4, #EC4899)',
          color: 'white',
          fallbackClasses: 'bg-health-600 hover:bg-health-700 text-white !text-white',
          focusRingColor: 'focus:ring-health-500'
        },
        medical: {
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: 'white',
          fallbackClasses: 'bg-medical-600 hover:bg-medical-700 text-white !text-white',
          focusRingColor: 'focus:ring-medical-500'
        },
        health: {
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: 'white',
          fallbackClasses: 'bg-health-600 hover:bg-health-700 text-white !text-white',
          focusRingColor: 'focus:ring-health-500'
        },
        emergency: {
          background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
          color: 'white',
          fallbackClasses: 'bg-emergency-600 hover:bg-emergency-700 text-white !text-white',
          focusRingColor: 'focus:ring-emergency-500'
        },
        outline: {
          background: 'transparent',
          color: '#2563EB',
          border: '2px solid #2563EB',
          fallbackClasses: 'border-2 border-medical-600 text-medical-600 hover:bg-medical-50',
          focusRingColor: 'focus:ring-medical-500'
        },
        ghost: {
          background: 'transparent',
          color: '#374151',
          fallbackClasses: 'text-neutral-700 hover:bg-neutral-100',
          focusRingColor: 'focus:ring-gray-500'
        }
      };
      return styles[variant] || styles.primary;
    };

    const variantStyle = getVariantStyle();
    const additionalClasses = variant === 'outline' ? 'border-2 hover:bg-medical-50' : 
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
          border: variantStyle.border || 'none'
        } : {
          border: variantStyle.border || 'none',
          color: variantStyle.color
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