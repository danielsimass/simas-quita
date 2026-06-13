import { SavingsSource } from '@simas-quita/shared-financing-types';
import { useTranslation } from '../../i18n/use-translation';
import { Badge } from '../ui/badge';

type SavingsBadgeProps = {
  source: SavingsSource;
};

export function SavingsBadge({ source }: SavingsBadgeProps) {
  const { t } = useTranslation();

  if (source === SavingsSource.BANK_CALIBRATED) {
    return <Badge variant="success">{t('savings.real')}</Badge>;
  }

  return <Badge variant="warning">{t('savings.estimated')}</Badge>;
}
