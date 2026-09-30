// Formatting utilities for Uzbek language & currency

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "0 so'm";
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    return `${day}.${month}.${year}`;
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const UZ_MONTH_NAMES: Record<string, string> = {
  '01': 'Yanvar',
  '02': 'Fevral',
  '03': 'Mart',
  '04': 'Aprel',
  '05': 'May',
  '06': 'Iyun',
  '07': 'Iyul',
  '08': 'Avgust',
  '09': 'Sentyabr',
  '10': 'Oktyabr',
  '11': 'Noyabr',
  '12': 'Dekabr',
};

export function formatMonthPeriod(period: string): string {
  if (!period) return '';
  const parts = period.split('-');
  if (parts.length === 2) {
    const month = UZ_MONTH_NAMES[parts[1]] || parts[1];
    return `${month} ${parts[0]}`;
  }
  return period;
}

export const DAYS_OF_WEEK = [
  { id: 'Dushanba', short: 'Dush', num: 1 },
  { id: 'Seshanba', short: 'Sesh', num: 2 },
  { id: 'Chorshanba', short: 'Chor', num: 3 },
  { id: 'Payshanba', short: 'Pay', num: 4 },
  { id: 'Juma', short: 'Jum', num: 5 },
  { id: 'Shanba', short: 'Shan', num: 6 },
  { id: 'Yakshanba', short: 'Yak', num: 0 },
];

export const PAYMENT_METHODS = {
  cash: "Naqd pul",
  card_click_payme: "Karta (Payme/Click/Uzum)",
  bank_transfer: "Bank o'tkazmasi",
};

export const AVATAR_COLORS = [
  'bg-blue-500 text-white',
  'bg-emerald-500 text-white',
  'bg-purple-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-500 text-white',
  'bg-indigo-500 text-white',
  'bg-violet-500 text-white',
];

export function getRandomColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function generateReceiptNo(): string {
  const prefix = 'EDU';
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
}
