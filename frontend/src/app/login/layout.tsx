"use client";

import React from 'react';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-0">
      <header className="w-full max-w-md p-4 text-center">
        <h1 className="text-xl sm:text-3xl font-bold">Vet Scheduler</h1>
      </header>
      <div className="w-full flex-1 flex items-center justify-center min-h-0">{children}</div>
      <footer className="w-full max-w-md p-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Vet Scheduler
      </footer>
    </div>
  );
}
    