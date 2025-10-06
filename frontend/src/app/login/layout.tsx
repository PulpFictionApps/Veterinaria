"use client";

import React from 'react';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-0">
      <header className="w-full max-w-md p-4 text-center">

      </header>
      <div className="w-full flex-1 flex items-center justify-center min-h-0">{children}</div>
      {/* Footer is provided globally in root layout */}
    </div>
  );
}
    
