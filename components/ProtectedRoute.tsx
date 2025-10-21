'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showTimeout, setShowTimeout] = useState(false);

  // Public routes that don't need authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Timeout for loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('[ProtectedRoute] Loading timeout - auth context may be stuck');
        setShowTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  useEffect(() => {
    // Only redirect if not on a public route and not authenticated
    if (!loading && !user && !isPublicRoute) {
      console.log('[ProtectedRoute] Redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router, isPublicRoute, pathname]);

  // Always render login page without protection
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication for protected routes
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        {showTimeout && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md">
            <p className="text-sm text-yellow-800">
              Taking longer than expected. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
