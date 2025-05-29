'use client';

import { useRouter, usePathname } from '../../i18n/navigation';
import {useLocale} from 'next-intl';


export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // Navigate to the same path in the new locale
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select
      className="fixed top-4 left-4 z-50 p-2 rounded shadow"
      onChange={handleChange}
      value={locale}
    >
      <option value="en">English</option>
      <option value="nl">Nederlands</option>
    </select>
  );
}
