'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/services/auth.service';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      console.log('[ProtectedRoute] Auth check - token exists:', !!token);
      
      if (!token) {
        console.log('[ProtectedRoute] User not authenticated, redirecting to login');
        router.push('/login');
      } else {
        console.log('[ProtectedRoute] User is authenticated, showing protected content');
        setAuthenticated(true);
      }
    };
    
    checkAuth();
  }, [router]);

  // During server-side rendering and initial client render, show loading
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="loading-spinner mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>;
  }
  
  return authenticated ? <>{children}</> : null;
};

export default ProtectedRoute; 