import type { CalendarEvent } from '../types';
import { parseDate, getMonthName, countWeekdays } from './dates';

export function exportAsText(events: CalendarEvent[]): string {
  if (events.length === 0) return 'No events.';

  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Group by month of start date
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of sorted) {
    const date = parseDate(event.startDate);
    const key = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
    const group = groups.get(key) || [];
    group.push(event);
    groups.set(key, group);
  }

  const lines: string[] = [];
  for (const [monthLabel, monthEvents] of groups) {
    lines.push(monthLabel);
    for (const event of monthEvents) {
      const start = parseDate(event.startDate);
      const end = parseDate(event.endDate);
      const startStr = `${getMonthName(start.getMonth()).slice(0, 3)} ${start.getDate()}`;
      let dateRange = startStr;
      if (event.startDate !== event.endDate) {
        const endStr =
          start.getMonth() === end.getMonth()
            ? `${end.getDate()}`
            : `${getMonthName(end.getMonth()).slice(0, 3)} ${end.getDate()}`;
        dateRange = `${startStr}-${endStr}`;
      }
      lines.push(`  ${dateRange}: ${event.title}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function exportAsCsv(events: CalendarEvent[]): string {
  const header = 'Start Date,End Date,Title,Type,Days';
  const rows = [...events]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((event) => {
      const days = countWeekdays(event.startDate, event.endDate);
      const title = event.title.includes(',')
        ? `"${event.title}"`
        : event.title;
      return `${event.startDate},${event.endDate},${title},${event.type},${days}`;
    });

  return [header, ...rows].join('\n');
}
