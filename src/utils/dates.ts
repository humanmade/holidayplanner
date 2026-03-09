export interface MonthInfo {
  year: number;
  month: number; // 0-11
}

export function getYearMonths(startMonth: number, year: number): MonthInfo[] {
  const months: MonthInfo[] = [];
  for (let i = 0; i < 12; i++) {
    const month = (startMonth + i) % 12;
    const y = month < startMonth ? year + 1 : year;
    months.push({ year: y, month });
  }
  return months;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns 0 = Monday, 6 = Sunday */
export function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert from Sunday=0 to Monday=0
  return day === 0 ? 6 : day - 1;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function eachDayInRange(start: string, end: string): string[] {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const days: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function isWeekday(dateStr: string): boolean {
  const date = parseDate(dateStr);
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

export function countWeekdays(startDate: string, endDate: string): number {
  return eachDayInRange(startDate, endDate).filter(isWeekday).length;
}

export function dateToString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

export function isWeekend(year: number, month: number, day: number): boolean {
  const date = new Date(year, month, day);
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month];
}

export function formatDateShort(dateStr: string): string {
  const date = parseDate(dateStr);
  return `${getMonthName(date.getMonth()).slice(0, 3)} ${date.getDate()}`;
}
