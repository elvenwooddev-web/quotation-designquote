'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();

  // List of paths where the header should be hidden
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

  // Check if current path matches any auth paths
  const shouldHideHeader = authPaths.some(path => pathname?.startsWith(path));

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
