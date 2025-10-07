'use client';

import { LucideIcon } from 'lucide-react';
import ThemedCard from './ThemedCard';
import { FadeIn } from './Transitions';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, actions }: PageHeaderProps) {
  return (
    <FadeIn>
      <ThemedCard className="mb-6" padding="sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {title}
              </h1>
              <p className="text-gray-600 text-sm">
                {subtitle}
              </p>
            </div>
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </ThemedCard>
    </FadeIn>
  );
}