'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientLocale } from '@/lib/locale-detector';
import { getLocalizedPath } from '@/lib/i18n/config';

// Root page handles client-side redirection based on browser language
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getLocalizedPath('/', getClientLocale()) + window.location.search + window.location.hash);
  }, [router]);

  // Render nothing while redirecting
  return null;
}
