import { useCallback } from 'react';
import type { CalendarEvent } from '../types';
import { getYearMonths } from '../utils/dates';
import { useDragSelect } from '../hooks/useDragSelect';
import { MonthGrid } from './MonthGrid';

interface YearCalendarProps {
  yearStartMonth: number;
  year: number;
  events: CalendarEvent[];
  onCreateEvent: (startDate: string, endDate: string) => void;
}

export function YearCalendar({
  yearStartMonth,
  year,
  events,
  onCreateEvent,
}: YearCalendarProps) {
  const handleSelect = useCallback(
    (startDate: string, endDate: string) => {
      onCreateEvent(startDate, endDate);
    },
    [onCreateEvent]
  );

  const { onMouseDown, onMouseEnter, onMouseUp, getSelectedRange } =
    useDragSelect(handleSelect);

  const selectedDates = getSelectedRange();
  const months = getYearMonths(yearStartMonth, year);

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {months.map(({ year: y, month }) => (
        <MonthGrid
          key={`${y}-${month}`}
          year={y}
          month={month}
          events={events}
          selectedDates={selectedDates}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
        />
      ))}
    </div>
  );
}
