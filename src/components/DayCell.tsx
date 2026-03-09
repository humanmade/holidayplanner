import type { CalendarEvent, EventType } from '../types';
import { isToday, isWeekend } from '../utils/dates';

interface DayCellProps {
  dateStr: string;
  day: number;
  month: number;
  year: number;
  event: CalendarEvent | undefined;
  isSelected: boolean;
  onMouseDown: (date: string) => void;
  onMouseEnter: (date: string) => void;
}

const eventColors: Record<EventType, string> = {
  holiday: 'bg-blue-200 text-blue-900',
  company: 'bg-amber-200 text-amber-900',
  public: 'bg-green-200 text-green-900',
  school: 'bg-purple-200 text-purple-900',
};

export function DayCell({
  dateStr,
  day,
  month,
  year,
  event,
  isSelected,
  onMouseDown,
  onMouseEnter,
}: DayCellProps) {
  const today = isToday(dateStr);
  const weekend = isWeekend(year, month, day);

  let className =
    'h-8 w-full flex items-center justify-center text-xs rounded-sm cursor-pointer select-none transition-colors';

  if (isSelected) {
    className += ' bg-blue-400 text-white';
  } else if (event) {
    className += ' ' + eventColors[event.type];
  } else if (weekend) {
    className += ' bg-gray-100 text-gray-400';
  } else {
    className += ' hover:bg-gray-50 text-gray-700';
  }

  if (today) {
    className += ' ring-2 ring-blue-500 ring-inset';
  }

  return (
    <div
      className={className}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(dateStr);
      }}
      onMouseEnter={() => onMouseEnter(dateStr)}
      title={event ? event.title : undefined}
    >
      {day}
    </div>
  );
}
