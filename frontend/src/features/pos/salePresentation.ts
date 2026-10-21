export function calculateChange(total: number, received: number, payment: string) {
  if (payment !== 'Dinheiro') return 0;
  return Math.max(0, received - total);
}

export function canCompleteSale(total: number, received: number, payment: string) {
  return total > 0 && (payment !== 'Dinheiro' || received >= total);
}

export function temporaryOrderNumber(now = new Date()) {
  return String((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) % 1000000).padStart(6, '0');
}
