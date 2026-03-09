export type EventType = 'holiday' | 'company' | 'public' | 'school';

export interface CalendarEvent {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  title: string;
  type: EventType;
}

export type HolidaySource = '' | 'openholidays' | 'nager';

export interface AppSettings {
  totalDays: number;      // default 35
  yearStartMonth: number; // 0-11, default 3 (April)
  year: number;
  countryCode: string;        // ISO country code for public holidays ('' = none)
  subdivisionCode: string;    // subdivision code for regional holidays ('' = national only)
  countrySource: HolidaySource; // which API provides holidays for the selected country
}
