'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors');
  const tButtons = useTranslations('common.buttons');
  const locale = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--color-background))]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(var(--color-muted))] flex items-center justify-center">
          <FileQuestion className="w-8 h-8 text-[hsl(var(--color-muted-foreground))]" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">
            {t('pageNotFound')}
          </h1>
          <p className="text-[hsl(var(--color-muted-foreground))]">
            {t('pageNotFoundDescription')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            {t('goHome')}
          </Link>
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))] font-medium hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            {tButtons('back')}
          </button>
        </div>
      </div>
    </div>
  );
}
