import type { CalendarEvent } from '../types';
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  getMonthName,
  dateToString,
  eachDayInRange,
} from '../utils/dates';
import { DayCell } from './DayCell';

interface MonthGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDates: Set<string>;
  onMouseDown: (date: string) => void;
  onMouseEnter: (date: string) => void;
}

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function MonthGrid({
  year,
  month,
  events,
  selectedDates,
  onMouseDown,
  onMouseEnter,
}: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfWeek(year, month);

  // Build a map of date -> events for this month
  const dateEventMap = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const days = eachDayInRange(event.startDate, event.endDate);
    for (const day of days) {
      const existing = dateEventMap.get(day);
      if (existing) {
        existing.push(event);
      } else {
        dateEventMap.set(day, [event]);
      }
    }
  }

  const cells: React.ReactNode[] = [];

  // Empty cells for offset
  for (let i = 0; i < firstDayOffset; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = dateToString(year, month, day);
    cells.push(
      <DayCell
        key={dateStr}
        dateStr={dateStr}
        day={day}
        month={month}
        year={year}
        events={dateEventMap.get(dateStr) ?? []}
        isSelected={selectedDates.has(dateStr)}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        {getMonthName(month)} {year}
      </h3>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_HEADERS.map((header, i) => (
          <div
            key={i}
            className="h-6 flex items-center justify-center text-xs font-medium text-gray-400"
          >
            {header}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
}
