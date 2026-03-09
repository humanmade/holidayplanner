import { useCallback, useMemo, useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useEvents } from './hooks/useEvents';
import { usePublicHolidays } from './hooks/usePublicHolidays';
import { SettingsBar } from './components/SettingsBar';
import { YearCalendar } from './components/YearCalendar';
import { EventList } from './components/EventList';
import { EventSummary } from './components/EventSummary';
import { ExportMenu } from './components/ExportMenu';
import type { CalendarEvent } from './types';

function App() {
  const { settings, updateSettings } = useSettings();
  const { events, addEvent, removeEvent } = useEvents();
  const [ showSettings, setShowSettings ] = useState(false);

  const { publicHolidays, loading: holidaysLoading } = usePublicHolidays(
    settings.countryCode,
    settings.subdivisionCode,
    settings.year,
    settings.yearStartMonth,
    settings.countrySource
  );

  const allEvents = useMemo(
    () => [...events, ...publicHolidays],
    [events, publicHolidays]
  );

  const handleCreateEvent = useCallback(
    (startDate: string, endDate: string) => {
      const title = prompt('Event title:', 'Holiday');
      if (title === null) return; // cancelled

      const event: CalendarEvent = {
        id: crypto.randomUUID(),
        startDate,
        endDate,
        title: title || 'Holiday',
        type: 'holiday',
      };
      addEvent(event);
    },
    [addEvent]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Holiday Planner</h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 py-1.5 text-sm bg-white/40 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Settings
            </button>
          </div>
          <ExportMenu events={allEvents} />
        </div>

        {showSettings && (
          <SettingsBar settings={settings} onUpdate={updateSettings} />
        )}
        <EventSummary events={events} totalDays={settings.totalDays} />

        {holidaysLoading && (
          <p className="text-sm text-gray-500">Loading holidays...</p>
        )}

        <EventList events={allEvents} removeEvent={removeEvent} />

        <YearCalendar
          yearStartMonth={settings.yearStartMonth}
          year={settings.year}
          events={allEvents}
          onCreateEvent={handleCreateEvent}
        />
      </div>
    </div>
  );
}

export default App;
