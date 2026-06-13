const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const PERCENT_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(value: string | number): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(numericValue)) {
    return BRL_FORMATTER.format(0);
  }
  return BRL_FORMATTER.format(numericValue);
}

export function formatDate(value: string): string {
  const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const year = Number.parseInt(isoDateMatch[1], 10);
    const month = Number.parseInt(isoDateMatch[2], 10) - 1;
    const day = Number.parseInt(isoDateMatch[3], 10);
    return DATE_FORMATTER.format(new Date(year, month, day));
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return DATE_FORMATTER.format(date);
}

export function formatPercent(value: string | number): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(numericValue)) {
    return PERCENT_FORMATTER.format(0);
  }
  return PERCENT_FORMATTER.format(numericValue / 100);
}

export function parseCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '0.00';
  }
  const cents = Number.parseInt(digits, 10);
  return (cents / 100).toFixed(2);
}
