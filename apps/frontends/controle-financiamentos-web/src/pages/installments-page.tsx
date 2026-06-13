import { InstallmentsTable } from '../components/installments/installments-table';
import { useTranslation } from '../i18n/use-translation';

export function InstallmentsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('installments.title')}</h1>
      <InstallmentsTable />
    </div>
  );
}
