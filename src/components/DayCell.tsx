import type { CalendarEvent, EventType, HolidaySource } from '../types';
import { isToday, isWeekend } from '../utils/dates';

const typeLabels: Record<EventType, string> = {
  holiday: 'Personal Holiday',
  company: 'Company Holiday',
  public: 'Public Holiday',
  school: 'School Holiday',
};

const typeDotColors: Record<EventType, string> = {
  holiday: 'bg-blue-400',
  company: 'bg-amber-400',
  public: 'bg-green-500',
  school: 'bg-purple-500',
};

const sourceLabels: Record<HolidaySource, string> = {
  '': '',
  openholidays: 'Open Holidays',
  nager: 'Nager.Date',
  govuk: 'GOV.UK',
};

function formatDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (startDate === endDate) return fmt(start);
  return `${fmt(start)} \u2013 ${fmt(end)} (${days} days)`;
}

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
  const hasTooltip = events.length > 0;

  let className =
    'h-8 w-full flex items-center justify-center text-xs rounded-sm cursor-pointer select-none transition-colors border';

  if (hasTooltip) {
    className += ' group/tip';
  }

  // Background: selection > user event > weekend > default
  if (isSelected) {
    className += ' bg-blue-400 text-white';
  } else if (userEvent) {
    className += userEvent.type === 'holiday'
      ? ' bg-blue-200 text-blue-900'
      : ' bg-amber-200 text-amber-900';
  } else if (apiEvent) {
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

  return (
    <div
      className={`relative ${className}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(dateStr);
      }}
      onMouseEnter={() => onMouseEnter(dateStr)}
    >
      {day}
      {hasTooltip && (
        <div className="invisible group-hover/tip:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-lg px-3 py-2 whitespace-nowrap space-y-2">
            {events.map((event, i) => {
              const source = event.source ? sourceLabels[event.source] : '';
              const typeLabel = source
                ? `${typeLabels[event.type]} \u00b7 ${source}`
                : typeLabels[event.type];
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className={`mt-1 shrink-0 w-2 h-2 rounded-full ${typeDotColors[event.type]}`} />
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-gray-400">{typeLabel}</div>
                    <div className="text-gray-400">{formatDuration(event.startDate, event.endDate)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
          </div>
        </div>
      )}
    </div>
  );
}
