export type EventType = 'holiday' | 'company' | 'public';

export interface CalendarEvent {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  title: string;
  type: EventType;
}

export interface AppSettings {
  totalDays: number;      // default 35
  yearStartMonth: number; // 0-11, default 3 (April)
  year: number;
}
