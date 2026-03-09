import type { CalendarEvent } from '../types';
import { countWeekdays } from '../utils/dates';

interface EventSummaryProps {
  events: CalendarEvent[];
  totalDays: number;
}

export function EventSummary({ events, totalDays }: EventSummaryProps) {
  const holidayEvents = events.filter((e) => e.type === 'holiday');
  const daysUsed = holidayEvents.reduce(
    (sum, e) => sum + countWeekdays(e.startDate, e.endDate),
    0
  );
  const remaining = totalDays - daysUsed;
  const percentage = totalDays > 0 ? Math.min((daysUsed / totalDays) * 100, 100) : 0;
  const isOver = daysUsed > totalDays;

  return (
    <div className="bg-white sticky top-0 rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {daysUsed} of {totalDays} days used
        </span>
        <span
          className={`text-sm font-semibold ${isOver ? 'text-red-600' : 'text-gray-600'}`}
        >
          {isOver
            ? `${Math.abs(remaining)} days over`
            : `${remaining} days remaining`}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isOver ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
