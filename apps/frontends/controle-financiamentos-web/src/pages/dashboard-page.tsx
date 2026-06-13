import { LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardCharts } from '../components/dashboard/dashboard-charts';
import { DashboardInsightsCard } from '../components/dashboard/dashboard-insights';
import { DashboardKpisGrid } from '../components/dashboard/dashboard-kpis';
import { EmptyState } from '../components/shared/empty-state';
import { Skeleton } from '../components/ui/skeleton';
import { useSelectedFinancing } from '../contexts/financing-context';
import { useDashboard } from '../hooks/use-dashboard';
import { useSeedDemoFinancing } from '../hooks/use-financing';
import { useTranslation } from '../i18n/use-translation';
import { useToastContext } from '../providers/toast-provider';
import { Button } from '../components/ui/button';
import { ApiError } from '../lib/api-client';

export function DashboardPage() {
  const { selectedFinancingId } = useSelectedFinancing();
  const { data: dashboard, isLoading } = useDashboard(selectedFinancingId);
  const seedDemo = useSeedDemoFinancing();
  const { toast } = useToastContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSeedDemo = async () => {
    if (!selectedFinancingId) return;
    try {
      await seedDemo.mutateAsync(selectedFinancingId);
      toast({ title: t('dashboard.demoDataLoaded'), variant: 'success' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('dashboard.demoDataFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    }
  };

  if (!selectedFinancingId) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title={t('dashboard.noFinancingTitle')}
        description={t('dashboard.noFinancingDescription')}
        actionLabel={t('dashboard.createFinancing')}
        onAction={() => navigate('/app/financings/new')}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.financing.name}</h1>
          <p className="text-sm text-muted-foreground">{dashboard.financing.institution}</p>
        </div>
        <Button variant="outline" onClick={() => void handleSeedDemo()} disabled={seedDemo.isPending}>
          {t('dashboard.loadDemoData')}
        </Button>
      </div>

      <DashboardKpisGrid kpis={dashboard.kpis} />
      <DashboardCharts dashboard={dashboard} />
      <DashboardInsightsCard insights={dashboard.insights} />
    </div>
  );
}
