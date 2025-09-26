"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';

type Tutor = { id: number; name: string; email?: string; phone?: string };

import { redirect } from 'next/navigation';

// Redirects para mantener compatibilidad con rutas antiguas
export default function TutorsRedirect() {
  // Redirect /dashboard/tutors to /dashboard/clients
  redirect('/dashboard/clients');
}