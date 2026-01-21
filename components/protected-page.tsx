'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedPage({ children, requiredRole = 'PROFESSIONAL' }: ProtectedPageProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      router.push('/login');
    }
  }, [user, requiredRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4ecca3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
