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
      <ThemedCard className="mb-8" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {title}
              </h1>
              <p className="text-gray-600 text-base">
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