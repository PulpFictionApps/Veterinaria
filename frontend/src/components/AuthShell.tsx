"use client";

import React from 'react';

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="site-center w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="hidden md:flex p-6 items-center justify-center text-center text-gray-600">
            <div>
              <div className="mb-4 text-center">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#e6e9ff" strokeWidth="2"/><path d="M8 14s1.5-2 4-2 4 2 4 2" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm mt-2 text-gray-500">{subtitle}</p>
            </div>
          </div>

          <div className="p-4 flex items-center justify-center">
            <div className="w-full narrow">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
