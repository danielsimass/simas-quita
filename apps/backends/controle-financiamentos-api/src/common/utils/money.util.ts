const CENTS_FACTOR = 100;

export function roundHalfUp(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function toMoneyString(value: number): string {
  return roundHalfUp(value, 2).toFixed(2);
}

export function parseMoney(value: string | number): number {
  if (typeof value === 'number') {
    return roundHalfUp(value, 2);
  }

  return roundHalfUp(Number.parseFloat(value), 2);
}

export function sumMoney(values: number[]): number {
  const totalCents = values.reduce(
    (accumulator, current) => accumulator + Math.round(current * CENTS_FACTOR),
    0,
  );

  return totalCents / CENTS_FACTOR;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateIso(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function monthsBetween(start: Date, end: Date): number {
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  return yearDiff * 12 + monthDiff;
}
