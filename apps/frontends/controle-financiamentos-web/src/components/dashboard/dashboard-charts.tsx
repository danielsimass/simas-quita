import type { DashboardDto } from '@simas-quita/shared-financing-types';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from '../../i18n/use-translation';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type DashboardChartsProps = {
  dashboard: DashboardDto;
};

function toChartData(points: { date: string; value: string }[]) {
  return points.map((point) => ({
    date: formatDate(point.date),
    value: Number.parseFloat(point.value),
  }));
}

export function DashboardCharts({ dashboard }: DashboardChartsProps) {
  const { t } = useTranslation();
  const debtData = toChartData(dashboard.debtEvolution);
  const paymentsData = toChartData(dashboard.monthlyPayments);
  const prepaymentsData = toChartData(dashboard.monthlyPrepayments);

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>{t('dashboard.debtEvolution')}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={debtData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.monthlyPayments')}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.monthlyPrepayments')}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prepaymentsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
