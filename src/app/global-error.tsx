'use client';

import { useEffect, useState } from 'react';
import { defaultLocale, getLocaleFromPath, localeConfig, type Locale } from '@/lib/i18n/config';
import { getClientLocale } from '@/lib/locale-detector';
import { errorLabels } from '@/lib/i18n/error-labels';
import { withBasePath, getBasePath } from '@/lib/utils/path';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  useEffect(() => {
    console.error('Global error:', error);
    setLocale(getLocaleFromPath(window.location.pathname.slice(getBasePath().length)) ?? getClientLocale());
  }, [error]);
  const labels = errorLabels[locale];

  return (
    <html lang={locale} dir={localeConfig[locale].direction}>
      <body style={{ 
        margin: 0, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>
            {labels.pageError}
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {labels.pageErrorDescription}
          </p>
          {error.digest && (
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem', fontFamily: 'monospace' }}>
              {labels.errorId.replace('{id}', error.digest)}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            {labels.tryAgain}
          </button>
          <button
            onClick={() => window.location.href = withBasePath(`/${locale}/`)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e2e8f0',
              color: '#0f172a',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {labels.goHome}
          </button>
        </div>
      </body>
    </html>
  );
}
