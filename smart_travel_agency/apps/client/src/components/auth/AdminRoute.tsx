"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import Loading from '../../components/ui/loading';

export default function AdminRoute({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { state } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect if not loading anymore and either not authenticated or not admin
    if (!state.loading && (!state.isAuthenticated || !state.isAdmin)) {
      router.push('/login');
    }
  }, [state.loading, state.isAuthenticated, state.isAdmin, router]);
  
  // Show loading while checking auth status
  if (state.loading) {
    return <Loading />;
  }
  
  // Show children only if authenticated and admin
  return (state.isAuthenticated && state.isAdmin) ? <>{children}</> : null;
}