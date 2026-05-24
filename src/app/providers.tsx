'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { LocalityProvider } from '@/context/LocalityContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocalityProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </LocalityProvider>
  );
}
