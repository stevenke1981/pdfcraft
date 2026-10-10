'use client';

import { useEffect } from 'react';
import { localeConfig, type Locale } from '@/lib/i18n/config';

/** Keep the document language accurate after client-side locale navigation. */
export function LocaleDocument({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeConfig[locale].direction;
  }, [locale]);
  return null;
}
