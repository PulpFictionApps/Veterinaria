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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {title}
              </h1>
              <p className="text-gray-700 mt-1 font-medium">
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