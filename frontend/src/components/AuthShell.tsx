"use client";

import React, { useEffect, useRef, useState } from 'react';

export default function AuthShell({ title, subtitle, children, variant = 'login' }: { title: string; subtitle?: string; children: React.ReactNode; variant?: 'login' | 'register' }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardMaxHeight, setCardMaxHeight] = useState<string | null>(null);

  useEffect(() => {
    function compute() {
      try {
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        const headerH = header ? (header as HTMLElement).offsetHeight : 0;
        const footerH = footer ? (footer as HTMLElement).offsetHeight : 0;
        // leave a small gap of 32px total (16 top/bottom)
        const gap = 32;
        const max = `calc(100vh - ${headerH + footerH + gap}px)`;
        setCardMaxHeight(max);
      } catch (e) {
        setCardMaxHeight('calc(100vh - 160px)');
      }
    }

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const cardGradientClass = variant === 'register'
    ? 'bg-gradient-to-b from-green-50 to-white'
    : variant === 'login'
      ? 'bg-gradient-to-b from-blue-50 to-white'
      : 'bg-white';

  const leftPanelClass = variant === 'register'
    ? 'hidden md:flex p-6 items-center justify-center text-center text-gray-600 bg-gradient-to-b from-green-200 to-green-50'
    : variant === 'login'
      ? 'hidden md:flex p-6 items-center justify-center text-center text-gray-600 bg-gradient-to-b from-blue-200 to-blue-50'
      : 'hidden md:flex p-6 items-center justify-center text-center text-gray-600';

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-0">
      <div className="w-full flex items-center justify-center min-h-0 px-4">

        <div ref={cardRef} style={cardMaxHeight ? { maxHeight: cardMaxHeight, height: cardMaxHeight } : undefined} className={`w-full max-w-none ${cardGradientClass} rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch overflow-auto`}>
          <div className={leftPanelClass}>
            <div>
              <div className="mb-4 text-center flex items-center justify-center">
                {variant === 'login' ? (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#e6e9ff" strokeWidth="2" fill="#eef2ff" />
                    <path d="M8 14s1.5-2 4-2 4 2 4 2" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="16" height="16" rx="4" stroke="#e6f7ed" strokeWidth="2" fill="#2cc67a"/>
                    <path d="M8 12h8" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm mt-2 text-gray-500">{subtitle}</p>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center">
            <div className="w-full flex flex-col" style={{ minHeight: 0 }}>
              <div className="text-center mb-6">
                {/* no icon above title; icon rendered in left column */}
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              </div>
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
