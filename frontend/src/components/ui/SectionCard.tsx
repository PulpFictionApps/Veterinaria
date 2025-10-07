'use client';

import ThemedCard from './ThemedCard';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export default function SectionCard({ 
  title, 
  icon: Icon, 
  children, 
  className = '',
  headerActions 
}: SectionCardProps) {
  return (
    <ThemedCard className={`overflow-hidden ${className}`} padding="sm">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          {headerActions && (
            <div className="flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </ThemedCard>
  );
}