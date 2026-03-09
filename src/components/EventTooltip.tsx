import type { CalendarEvent, EventType, HolidaySource } from '../types';

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

interface EventTooltipProps {
  events: CalendarEvent[];
  position?: 'above' | 'below';
}

export function EventTooltip({ events, position = 'above' }: EventTooltipProps) {
  if (events.length === 0) return null;

  const isAbove = position === 'above';

  return (
    <div
      className={`invisible group-hover/tip:visible absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none ${
        isAbove ? 'bottom-full mb-2' : 'top-full mt-2'
      }`}
    >
      {!isAbove && (
        <div className="flex justify-center">
          <div className="w-2 h-2 bg-gray-900 rotate-45 -mb-1" />
        </div>
      )}
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
      {isAbove && (
        <div className="flex justify-center">
          <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}
