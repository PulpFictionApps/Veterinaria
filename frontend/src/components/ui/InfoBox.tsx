'use client';

import ThemedCard from './ThemedCard';
import { LucideIcon } from 'lucide-react';

interface InfoBoxProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: 'info' | 'warning' | 'success' | 'error';
  actions?: React.ReactNode;
}

export default function InfoBox({ 
  title, 
  description, 
  icon: Icon, 
  variant = 'info',
  actions 
}: InfoBoxProps) {
  const variantStyles = {
    info: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
    warning: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200',
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    error: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
  };

  const iconStyles = {
    info: 'text-blue-600',
    warning: 'text-orange-600',
    success: 'text-green-600',
    error: 'text-red-600'
  };

  return (
    <div className={`rounded-2xl border p-6 ${variantStyles[variant]}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 bg-white rounded-lg shadow-sm ${iconStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-2 text-lg">{title}</h3>
          <p className="text-gray-700 leading-relaxed">
            {description}
          </p>
          {actions && (
            <div className="mt-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}