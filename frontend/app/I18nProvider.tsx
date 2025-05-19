'use client';

import { NextIntlClientProvider, useMessages, useLocale } from 'next-intl';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function I18nProvider({ children }: Props) {
  const messages = useMessages();
  const locale = useLocale();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
