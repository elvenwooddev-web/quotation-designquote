import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  // AUTHENTICATION PAUSED - Allow all requests through
  // To re-enable authentication, uncomment the code below
  return NextResponse.next();

  /* AUTHENTICATION CODE (PAUSED)
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    isPublicRoute
  ) {
    return NextResponse.next();
  }

  // Check for demo user in request (localStorage is checked client-side)
  // For server-side middleware, we'll check Supabase session cookie

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.next();
  }

  try {
    // Get the session token from cookies
    const sessionToken = req.cookies.get('sb-access-token')?.value ||
                        req.cookies.get('sb-refresh-token')?.value;

    // If no session token, redirect to login
    if (!sessionToken) {
      // Check if there's a demo_user cookie for demo mode
      const demoUser = req.cookies.get('demo_user');
      if (!demoUser) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
