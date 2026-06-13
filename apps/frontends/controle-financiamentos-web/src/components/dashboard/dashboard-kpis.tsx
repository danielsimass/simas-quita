import type { DashboardKpis } from '@simas-quita/shared-financing-types';
import { useTranslation } from '../../i18n/use-translation';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type DashboardKpisProps = {
  kpis: DashboardKpis;
};

export function DashboardKpisGrid({ kpis }: DashboardKpisProps) {
  const { t } = useTranslation();

  const kpiItems = [
    { label: t('dashboard.kpi.financedAmount'), value: formatCurrency(kpis.financedAmount) },
    { label: t('dashboard.kpi.totalInstallments'), value: String(kpis.totalInstallments) },
    { label: t('dashboard.kpi.remainingInstallments'), value: String(kpis.remainingInstallments) },
    { label: t('dashboard.kpi.installmentAmount'), value: formatCurrency(kpis.installmentAmount) },
    { label: t('dashboard.kpi.totalToPay'), value: formatCurrency(kpis.totalToPay) },
    { label: t('dashboard.kpi.remainingBalance'), value: formatCurrency(kpis.remainingBalance) },
    { label: t('dashboard.kpi.totalPaid'), value: formatCurrency(kpis.totalPaid) },
    { label: t('dashboard.kpi.totalDiscount'), value: formatCurrency(kpis.totalDiscount) },
    { label: t('dashboard.percentPaidOff'), value: formatPercent(kpis.percentPaidOff) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {kpiItems.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
