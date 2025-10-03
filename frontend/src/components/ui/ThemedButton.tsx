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
    const { getPrimaryButtonStyle, secondaryGradient } = useThemeColors();

    const baseClasses = `
      font-semibold rounded-xl transition-all duration-300 
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95
      shadow-lg hover:shadow-xl
      ${fullWidth ? 'w-full' : ''}
    `;
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    const getVariantStyle = () => {
      const styles: Record<string, any> = {
        primary: {
          ...getPrimaryButtonStyle(),
          focusRingColor: 'focus:ring-medical-500'
        },
        secondary: {
          background: secondaryGradient,
          color: 'white',
          focusRingColor: 'focus:ring-health-500'
        },
        medical: {
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: 'white',
          focusRingColor: 'focus:ring-medical-500'
        },
        health: {
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: 'white',
          focusRingColor: 'focus:ring-health-500'
        },
        emergency: {
          background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
          color: 'white',
          focusRingColor: 'focus:ring-emergency-500'
        },
        outline: {
          background: 'transparent',
          color: '#2563EB',
          border: '2px solid #2563EB',
          focusRingColor: 'focus:ring-medical-500'
        },
        ghost: {
          background: 'transparent',
          color: '#374151',
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
          ${additionalClasses}
          ${className}
        `}
        style={variant !== 'outline' && variant !== 'ghost' ? {
          background: variantStyle.background,
          color: variantStyle.color,
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