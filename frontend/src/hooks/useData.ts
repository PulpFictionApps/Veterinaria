"use client";

import useSWR, { mutate } from 'swr';
import { authFetch } from '../lib/api';

// Configuración global para SWR
export const swrConfig = {
  refreshInterval: 30000, // Refrescar cada 30 segundos
  revalidateOnFocus: true, // Revalidar cuando la ventana obtiene el foco
  revalidateOnReconnect: true, // Revalidar cuando se reconecta la red
  dedupingInterval: 5000, // Evitar requests duplicados por 5 segundos
};

// Fetcher personalizado que usa authFetch
const fetcher = async (url: string) => {
  const response = await authFetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Hook para citas de un usuario
export function useAppointments(userId: number | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    userId ? `/appointments/${userId}` : null,
    fetcher,
    swrConfig
  );

  return {
    appointments: data || [],
    isLoading,
    error,
    revalidate
  };
}

// Hook para disponibilidad de un usuario
export function useAvailability(userId: number | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    userId ? `/availability/${userId}` : null,
    fetcher,
    swrConfig
  );

  return {
    availability: data || [],
    isLoading,
    error,
    revalidate
  };
}

// Hook para disponibilidad pública
export function usePublicAvailability(professionalId: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    professionalId ? `/availability/public/${professionalId}` : null,
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 10000, // Más frecuente para booking público
    }
  );

  return {
    availability: data || [],
    isLoading,
    error,
    revalidate
  };
}

// Hook para clientes/tutores
export function useClients() {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    '/tutors',
    fetcher,
    swrConfig
  );

  return {
    clients: data || [],
    isLoading,
    error,
    revalidate
  };
}

// Hook para mascotas de un cliente
export function usePets(tutorId: number | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    tutorId ? `/pets?tutorId=${tutorId}` : null,
    fetcher,
    swrConfig
  );

  return {
    pets: data || [],
    isLoading,
    error,
    revalidate
  };
}

// Hook para un cliente específico
export function useClient(clientId: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    clientId ? `/tutors/${clientId}` : null,
    fetcher,
    swrConfig
  );

  return {
    client: data,
    isLoading,
    error,
    revalidate
  };
}

// Hook para tipos de consulta
export function useConsultationTypes() {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    '/consultation-types',
    fetcher,
    swrConfig
  );

  return {
    consultationTypes: data || [],
    isLoading,
    error,
    revalidate
  };
}

export interface GoogleCalendarStatus {
  connected: boolean;
  syncEnabled?: boolean;
  calendarId?: string;
  connectedAt?: string | null;
  lastSyncedAt?: string | null;
  upcomingSyncedCount?: number;
}

export function useGoogleCalendarStatus(enabled: boolean) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    enabled ? '/google-calendar/status' : null,
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 60000,
    }
  );

  return {
    googleStatus: (data as GoogleCalendarStatus | undefined) ?? null,
    isLoading,
    error,
    revalidate,
  };
}

// Hook para configuración de usuario (incluyendo colores de tema)
export function useUserSettings(userId: number | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    userId ? `/users/${userId}` : null,
    fetcher,
    swrConfig
  );

  return {
    settings: data,
    isLoading,
    error,
    revalidate
  };
}

// Funciones de utilidad para invalidar cache relacionado
export const invalidateCache = {
  // Invalidar todas las citas
  appointments: (userId?: number) => {
    if (userId) {
      mutate(`/appointments/${userId}`);
    } else {
      mutate(key => typeof key === 'string' && key.includes('/appointments'));
    }
  },

  // Invalidar disponibilidad
  availability: (userId?: number) => {
    if (userId) {
      mutate(`/availability/${userId}`);
      mutate(`/availability/public/${userId}`);
    } else {
      mutate(key => typeof key === 'string' && key.includes('/availability'));
    }
  },

  // Invalidar clientes
  clients: () => {
    mutate('/tutors');
    mutate(key => typeof key === 'string' && key.includes('/tutors'));
  },

  // Invalidar mascotas
  pets: (tutorId?: number) => {
    if (tutorId) {
      mutate(`/pets?tutorId=${tutorId}`);
    } else {
      mutate(key => typeof key === 'string' && key.includes('/pets'));
    }
  },

  // Invalidar configuración de usuario
  userSettings: (userId?: number) => {
    if (userId) {
      mutate(`/users/${userId}/settings`);
    } else {
      mutate(key => typeof key === 'string' && key.includes('/users'));
    }
  },

  // Invalidar tipos de consulta
  consultationTypes: () => {
    mutate('/consultation-types');
  },

  // Invalidar todo
  all: () => {
    mutate(() => true);
  }
};