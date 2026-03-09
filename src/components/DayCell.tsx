import type { CalendarEvent } from '../types';
import { isToday, isWeekend } from '../utils/dates';

interface DayCellProps {
  dateStr: string;
  day: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  isSelected: boolean;
  onMouseDown: (date: string) => void;
  onMouseEnter: (date: string) => void;
}

export function DayCell({
  dateStr,
  day,
  month,
  year,
  events,
  isSelected,
  onMouseDown,
  onMouseEnter,
}: DayCellProps) {
  const today = isToday(dateStr);
  const weekend = isWeekend(year, month, day);

  const userEvent = events.find((e) => e.type === 'holiday' || e.type === 'company');
  const apiEvent = events.find((e) => e.type === 'public' || e.type === 'school');

  let className =
    'h-8 w-full flex items-center justify-center text-xs rounded-sm cursor-pointer select-none transition-colors border';

  // Background: selection > user event > weekend > default
  if (isSelected) {
    className += ' bg-blue-400 text-white';
  } else if (userEvent) {
    className += userEvent.type === 'holiday'
      ? ' bg-blue-200 text-blue-900'
      : ' bg-amber-200 text-amber-900';
  } else if (apiEvent) {
    // No background for API-only events, but set text color for readability
    if (weekend) {
      className += ' text-gray-400';
    } else {
      className += ' text-gray-700';
    }
  } else if (weekend) {
    className += ' bg-gray-100 text-gray-400';
  } else {
    className += ' hover:bg-gray-50 text-gray-700';
  }

  // Border: public/school holiday outline
  if (apiEvent) {
    className += apiEvent.type === 'public'
      ? ' border-green-500'
      : ' border-purple-500';
  } else {
    className += ' border-transparent';
  }

  if (today) {
    className += ' ring-2 ring-blue-500 ring-inset';
  }

  const titles = events.map((e) => e.title);
  const tooltip = titles.length > 0 ? titles.join(', ') : undefined;

  return (
    <div
      className={className}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(dateStr);
      }}
      onMouseEnter={() => onMouseEnter(dateStr)}
      title={tooltip}
    >
      {day}
    </div>
  );
}
