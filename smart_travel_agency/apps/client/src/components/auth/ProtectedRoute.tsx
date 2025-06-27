"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';

export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { state } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!state.loading && !state.isAuthenticated) {
      router.push('/login');
    }
  }, [state.isAuthenticated, state.loading, router]);
  
  if (state.loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return state.isAuthenticated ? <>{children}</> : null;
}