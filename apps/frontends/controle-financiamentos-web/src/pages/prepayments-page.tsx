import { PrepaymentsPanel } from '../components/prepayments/prepayments-panel';
import { useTranslation } from '../i18n/use-translation';

export function PrepaymentsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('prepayments.title')}</h1>
      <PrepaymentsPanel />
    </div>
  );
}
