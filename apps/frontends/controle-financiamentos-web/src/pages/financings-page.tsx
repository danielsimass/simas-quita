import { FinancingWizard } from '../components/financing/financing-wizard';
import { useTranslation } from '../i18n/use-translation';

export function FinancingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('financing.newTitle')}</h1>
      <FinancingWizard />
    </div>
  );
}
