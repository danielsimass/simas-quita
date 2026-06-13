import type { DashboardInsights } from '@simas-quita/shared-financing-types';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from '../../i18n/use-translation';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type DashboardInsightsProps = {
  insights: DashboardInsights;
};

export function DashboardInsightsCard({ insights }: DashboardInsightsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <CardTitle>{t('dashboard.insights')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('dashboard.totalDiscount')}</span>
          <span className="font-semibold">{formatCurrency(insights.totalDiscount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('dashboard.kpi.remainingBalance')}</span>
          <span className="font-semibold">{formatCurrency(insights.remainingBalance)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t('dashboard.percentPaidOff')}</span>
          <span className="font-semibold">{formatPercent(insights.percentPaidOff)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
