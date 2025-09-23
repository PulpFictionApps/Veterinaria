"use client";

import React from 'react';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 w-full">
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
