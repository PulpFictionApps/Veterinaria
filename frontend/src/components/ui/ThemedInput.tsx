'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { LucideIcon } from 'lucide-react';

interface ThemedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'medical' | 'search';
  helpText?: string;
}

const ThemedInput = forwardRef<HTMLInputElement, ThemedInputProps>(
  ({ 
    label, 
    error, 
    icon: Icon, 
    iconPosition = 'left',
    variant = 'default',
    helpText,
    className = '', 
    ...props 
  }, ref) => {
    // Los colores ahora se manejan con CSS variables

    const baseInputClasses = `
      w-full px-4 py-3 rounded-xl border transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-offset-1
      disabled:opacity-50 disabled:cursor-not-allowed
      placeholder:text-gray-400
      text-base sm:text-sm
      touch-manipulation
    `;

    const variantClasses = {
      default: `
        border-gray-300 focus:border-gray-500 focus:ring-gray-500/20
        bg-white hover:border-gray-400
      `,
      medical: `
        border-gray-200 focus:border-gray-500 focus:ring-gray-500/20
        bg-gradient-to-r from-gray-50/30 to-white hover:border-gray-300
      `,
      search: `
        border-gray-200 focus:border-gray-500 focus:ring-gray-500/20
        bg-gray-50 hover:bg-white hover:border-gray-300
      `
    };

    const errorClasses = error ? 'border-gray-500 focus:border-gray-500 focus:ring-gray-500/20' : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-gray-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400" />
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              ${baseInputClasses}
              ${variantClasses[variant]}
              ${errorClasses}
              ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${className}
            `}
            style={{
              '--tw-ring-color': error ? '#DC2626' : 'var(--color-primary)'
            } as React.CSSProperties}
            {...props}
          />
          
          {Icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

ThemedInput.displayName = 'ThemedInput';

export default ThemedInput;