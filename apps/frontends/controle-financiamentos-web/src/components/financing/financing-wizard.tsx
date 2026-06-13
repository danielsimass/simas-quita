import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFinancing } from '../../hooks/use-financing';
import { useSelectedFinancing } from '../../contexts/financing-context';
import { useTranslation } from '../../i18n/use-translation';
import { useToastContext } from '../../providers/toast-provider';
import { ApiError } from '../../lib/api-client';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const TOTAL_STEPS = 2;

type WizardForm = {
  name: string;
  institution: string;
  financedAmount: string;
  installmentCount: string;
  installmentAmount: string;
  firstDueDate: string;
  notes: string;
};

const initialForm: WizardForm = {
  name: '',
  institution: '',
  financedAmount: '',
  installmentCount: '36',
  installmentAmount: '',
  firstDueDate: '',
  notes: '',
};

export function FinancingWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(initialForm);
  const createFinancing = useCreateFinancing();
  const { setSelectedFinancingId } = useSelectedFinancing();
  const { toast } = useToastContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const updateField = (field: keyof WizardForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const totalToPay =
    form.installmentCount && form.installmentAmount
      ? Number.parseFloat(form.installmentCount) * Number.parseFloat(form.installmentAmount)
      : 0;

  const handleSubmit = async () => {
    try {
      const financing = await createFinancing.mutateAsync({
        name: form.name,
        institution: form.institution,
        financedAmount: form.financedAmount,
        installmentCount: Number.parseInt(form.installmentCount, 10),
        installmentAmount: form.installmentAmount,
        firstDueDate: form.firstDueDate,
        notes: form.notes || null,
      });

      setSelectedFinancingId(financing.id);
      toast({
        title: t('financing.created'),
        description: t('financing.createdDescription'),
        variant: 'success',
      });
      navigate('/app/dashboard');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t('financing.createFailed');
      toast({ title: t('common.error'), description: message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('financing.newTitle')}</CardTitle>
        <CardDescription>
          {t('financing.wizardDescription', { step, total: TOTAL_STEPS })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t('common.name')}</Label>
              <Input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">{t('financing.institution')}</Label>
              <Input
                id="institution"
                value={form.institution}
                onChange={(e) => updateField('institution', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">{t('financing.notes', { optional: t('common.optional') })}</Label>
              <Input id="notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="financedAmount">{t('financing.financedAmount')}</Label>
              <Input
                id="financedAmount"
                type="number"
                step="0.01"
                value={form.financedAmount}
                onChange={(e) => updateField('financedAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installmentAmount">{t('financing.installmentAmount')}</Label>
              <Input
                id="installmentAmount"
                type="number"
                step="0.01"
                value={form.installmentAmount}
                onChange={(e) => updateField('installmentAmount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installmentCount">{t('financing.installmentCount')}</Label>
              <Input
                id="installmentCount"
                type="number"
                value={form.installmentCount}
                onChange={(e) => updateField('installmentCount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstDueDate">{t('financing.dueDay')}</Label>
              <Input
                id="firstDueDate"
                type="date"
                value={form.firstDueDate}
                onChange={(e) => updateField('firstDueDate', e.target.value)}
              />
            </div>
            {totalToPay > 0 ? (
              <div className="rounded-lg border bg-muted/50 p-4 md:col-span-2">
                <p className="text-sm text-muted-foreground">{t('financing.totalToPayPreview')}</p>
                <p className="text-lg font-semibold">
                  {totalToPay.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1}
          >
            {t('common.back')}
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((current) => current + 1)}>{t('common.next')}</Button>
          ) : (
            <Button onClick={() => void handleSubmit()} disabled={createFinancing.isPending}>
              {createFinancing.isPending ? t('financing.creating') : t('financing.create')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
