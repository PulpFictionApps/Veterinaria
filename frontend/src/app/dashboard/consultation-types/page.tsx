"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';

interface ConsultationType {
  id: number;
  name: string;
  price: number; // in cents
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

import { redirect } from 'next/navigation';

// Redirects para mantener compatibilidad con rutas antiguas
export default function ConsultationTypesRedirect() {
  // Redirect /dashboard/consultation-types to /dashboard/consultations
  redirect('/dashboard/consultations');
}