"use client";

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { swrConfig } from '../hooks/useData';

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig 
      value={{ 
        ...swrConfig,
        // Error retry con backoff exponencial
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        // Configuración para mejor UX
        loadingTimeout: 10000,
        onError: (error) => {
          console.error('SWR Error:', error);
        },
        onSuccess: (data, key) => {
          console.log('SWR Success:', key, data);
        }
      }}
    >
      {children}
    </SWRConfig>
  );
}
