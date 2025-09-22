"use client";

import React from 'react';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-6xl">
        {children}
      </div>
    </div>
  );
}
