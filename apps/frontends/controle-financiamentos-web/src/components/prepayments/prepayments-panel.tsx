import { PiggyBank, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  useCreatePrepayment,
  useDeletePrepayment,
  usePrepayments,
  useUpdatePrepayment,
} from '../../hooks/use-prepayments';
import { useSelectedFinancing } from '../../contexts/financing-context';
import { useTranslation } from '../../i18n/use-translation';
import { useToastContext } from '../../providers/toast-provider';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { ApiError } from '../../lib/api-client';
import { ConfirmDialog } from '../shared/confirm-dialog';
import { EmptyState } from '../shared/empty-state';
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

type PrepaymentForm = {
  date: string;
  amount: string;
  installmentCount: string;
};

const emptyForm: PrepaymentForm = {
  date: '',
  amount: '',
  installmentCount: '1',
};

export function PrepaymentsPanel() {
  const { selectedFinancingId } = useSelectedFinancing();
  const { data: prepayments, isLoading } = usePrepayments(selectedFinancingId);
  const createPrepayment = useCreatePrepayment(selectedFinancingId ?? '');
  const updatePrepayment = useUpdatePrepayment(selectedFinancingId ?? '');
  const deletePrepayment = useDeletePrepayment(selectedFinancingId ?? '');
  const { toast } = useToastContext();
  const { t } = useTranslation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PrepaymentForm>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (prepayment: {
    id: string;
    date: string;
    amount: string;
    installmentCount: number;
  }) => {
    setEditingId(prepayment.id);
    setForm({
      date: prepayment.date.slice(0, 10),
      amount: prepayment.amount,
      installmentCount: String(prepayment.installmentCount),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      date: form.date,
      amount: form.amount,
      installmentCount: Number.parseInt(form.installmentCount, 10),
    };

    try {
      if (editingId) {
        await updatePrepayment.mutateAsync({ prepaymentId: editingId, input: payload });
        toast({ title: t('prepayments.updated'), variant: 'success' });
      } else {
        await createPrepayment.mutateAsync(payload);
        toast({ title: t('prepayments.created'), variant: 'success' });
      }
      setDialogOpen(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('prepayments.saveFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePrepayment.mutateAsync(deleteId);
      toast({ title: t('prepayments.deleted'), variant: 'success' });
      setDeleteId(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('prepayments.deleteFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    }
  };

  if (!selectedFinancingId) {
    return (
      <EmptyState
        icon={PiggyBank}
        title={t('prepayments.noFinancingSelected')}
        description={t('prepayments.noFinancingDescription')}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('prepayments.title')}</CardTitle>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('prepayments.add')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : null}

        {!isLoading && !prepayments?.length ? (
          <EmptyState
            icon={PiggyBank}
            title={t('prepayments.emptyTitle')}
            description={t('prepayments.emptyDescription')}
            actionLabel={t('prepayments.add')}
            onAction={openCreate}
          />
        ) : null}

        {!isLoading && prepayments?.length ? (
          <div className="space-y-3">
            {prepayments.map((prepayment) => (
              <div
                key={prepayment.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium">{formatCurrency(prepayment.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(prepayment.date)} ·{' '}
                    {t('prepayments.installmentCountLabel', {
                      count: prepayment.installmentCount,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('prepayments.paidInstallments')}:{' '}
                    {prepayment.paidInstallmentNumbers.sort((a, b) => b - a).join(', ')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span>
                      {t('prepayments.discount')}: {formatCurrency(prepayment.discount)}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span>
                      {t('prepayments.remainingBalance')}:{' '}
                      {formatCurrency(prepayment.remainingBalanceAfter)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(prepayment)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(prepayment.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t('prepayments.editTitle') : t('prepayments.newTitle')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="prepaymentDate">{t('common.date')}</Label>
              <Input
                id="prepaymentDate"
                type="date"
                value={form.date}
                onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepaymentAmount">{t('prepayments.totalAmount')}</Label>
              <Input
                id="prepaymentAmount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installmentCount">{t('prepayments.installmentCount')}</Label>
              <Input
                id="installmentCount"
                type="number"
                min="1"
                value={form.installmentCount}
                onChange={(e) =>
                  setForm((current) => ({ ...current, installmentCount: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                {t('prepayments.installmentCountHint')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={createPrepayment.isPending || updatePrepayment.isPending}
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('prepayments.deleteTitle')}
        description={t('prepayments.deleteDescription')}
        confirmLabel={t('common.delete')}
        onConfirm={() => void handleDelete()}
        isLoading={deletePrepayment.isPending}
      />
    </Card>
  );
}
