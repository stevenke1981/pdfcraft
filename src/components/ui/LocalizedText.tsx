'use client';

import { useTranslations } from 'next-intl';

/** Text for loading boundaries defined outside a component's hook scope. */
export function LocalizedText({ messageKey }: { messageKey: string }) {
  const t = useTranslations();
  return t(messageKey);
}
