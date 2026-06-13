import { InstallmentStatus } from '@simas-quita/shared-financing-types';
import { Check, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  useDeleteInstallment,
  useInstallments,
  useUpdateInstallment,
  type InstallmentFilter,
} from '../../hooks/use-installments';
import { useSelectedFinancing } from '../../contexts/financing-context';
import { useTranslation } from '../../i18n/use-translation';
import { useToastContext } from '../../providers/toast-provider';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { ApiError } from '../../lib/api-client';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { EmptyState } from '../shared/empty-state';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export function InstallmentsTable() {
  const { selectedFinancingId } = useSelectedFinancing();
  const [filter, setFilter] = useState<InstallmentFilter>('all');
  const { data: installments, isLoading } = useInstallments(selectedFinancingId, filter);
  const updateInstallment = useUpdateInstallment(selectedFinancingId ?? '');
  const deleteInstallment = useDeleteInstallment(selectedFinancingId ?? '');
  const { toast } = useToastContext();
  const { t } = useTranslation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEdit = (installment: { id: string; amount: string; dueDate: string }) => {
    setEditingId(installment.id);
    setEditAmount(installment.amount);
    setEditDueDate(installment.dueDate.slice(0, 10));
  };

  const handleMarkPaid = async (installmentId: string) => {
    try {
      await updateInstallment.mutateAsync({
        installmentId,
        input: { paidAt: new Date().toISOString() },
      });
      toast({ title: t('installments.markedAsPaid'), variant: 'success' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('installments.updateFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      await updateInstallment.mutateAsync({
        installmentId: editingId,
        input: { amount: editAmount, dueDate: editDueDate },
      });
      toast({ title: t('installments.updated'), variant: 'success' });
      setEditingId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('installments.updateFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteInstallment.mutateAsync(deleteId);
      toast({ title: t('installments.deleted'), variant: 'success' });
      setDeleteId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('installments.deleteFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    }
  };

  if (!selectedFinancingId) {
    return (
      <EmptyState
        icon={CreditCard}
        title={t('installments.noFinancingSelected')}
        description={t('installments.noFinancingDescription')}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{t('installments.title')}</CardTitle>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as InstallmentFilter)}>
          <TabsList>
            <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
            <TabsTrigger value={InstallmentStatus.PAID}>{t('installments.filter.paid')}</TabsTrigger>
            <TabsTrigger value={InstallmentStatus.PENDING}>{t('installments.filter.pending')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : null}

        {!isLoading && !installments?.length ? (
          <EmptyState
            icon={CreditCard}
            title={t('installments.notFound')}
            description={t('installments.notFoundDescription')}
          />
        ) : null}

        {!isLoading && installments?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-2">#</th>
                  <th className="p-2">{t('installments.dueDate')}</th>
                  <th className="p-2">{t('common.amount')}</th>
                  <th className="p-2">{t('installments.status')}</th>
                  <th className="p-2 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((installment) => (
                  <tr key={installment.id} className="border-b">
                    <td className="p-2">{installment.number}</td>
                    <td className="p-2">{formatDate(installment.dueDate)}</td>
                    <td className="p-2">{formatCurrency(installment.amount)}</td>
                    <td className="p-2">
                      <Badge variant={installment.status === InstallmentStatus.PAID ? 'success' : 'secondary'}>
                        {t(`installments.statusLabel.${installment.status}`)}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-end gap-1">
                        {installment.status === InstallmentStatus.PENDING ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void handleMarkPaid(installment.id)}
                            aria-label={t('installments.markAsPaid')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(installment)}
                          aria-label={t('installments.edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(installment.id)}
                          aria-label={t('installments.delete')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>

      <Dialog open={Boolean(editingId)} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('installments.editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="editAmount">{t('common.amount')}</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDueDate">{t('installments.dueDate')}</Label>
              <Input
                id="editDueDate"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void handleSaveEdit()} disabled={updateInstallment.isPending}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('installments.deleteTitle')}
        description={t('installments.deleteDescription')}
        confirmLabel={t('common.delete')}
        onConfirm={() => void handleDelete()}
        isLoading={deleteInstallment.isPending}
      />
    </Card>
  );
}
