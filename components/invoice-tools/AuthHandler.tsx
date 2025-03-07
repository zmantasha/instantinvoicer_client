// components/AuthHandler.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../hooks/UserContext';
import Cookies from 'js-cookie';

export default function AuthHandler() {
  const router = useRouter();
  const { clearUser } = useUser();

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('accessToken');
      const user = localStorage.getItem('user');
      
      if (!token && user) {
        // Clear stale user data
        localStorage.removeItem('user');
        clearUser();
        router.push('/account/login');
      }
    };

    // Check on initial load
    checkAuth();
    
    // Check on every route change
    const handleRouteChange = () => checkAuth();
    window.addEventListener('popstate', handleRouteChange);

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [clearUser, router]);

  return null;
}