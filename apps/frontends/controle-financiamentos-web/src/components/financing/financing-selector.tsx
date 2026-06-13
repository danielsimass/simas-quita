import { useFinancings } from '../../hooks/use-financing';
import { useSelectedFinancing } from '../../contexts/financing-context';
import { useTranslation } from '../../i18n/use-translation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Skeleton } from '../ui/skeleton';

export function FinancingSelector() {
  const { data: financings, isLoading } = useFinancings();
  const { selectedFinancingId, setSelectedFinancingId } = useSelectedFinancing();
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton className="h-11 w-full max-w-xs" />;
  }

  if (!financings?.length) {
    return <p className="text-sm text-muted-foreground">{t('financing.noFinancings')}</p>;
  }

  return (
    <Select
      value={selectedFinancingId ?? undefined}
      onValueChange={(value) => setSelectedFinancingId(value)}
    >
      <SelectTrigger className="w-full max-w-xs" aria-label={t('financing.selectFinancing')}>
        <SelectValue placeholder={t('financing.selectFinancing')} />
      </SelectTrigger>
      <SelectContent>
        {financings.map((financing) => (
          <SelectItem key={financing.id} value={financing.id}>
            {financing.name} — {financing.institution}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
