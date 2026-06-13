import { useMemo } from 'react';
import { createTranslator } from './create-translator';

export function useTranslation() {
  const t = useMemo(() => createTranslator(), []);

  return { t };
}
