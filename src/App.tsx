import { useCallback, useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useEvents } from './hooks/useEvents';
import { SettingsBar } from './components/SettingsBar';
import { YearCalendar } from './components/YearCalendar';
import { EventSummary } from './components/EventSummary';
import { ExportMenu } from './components/ExportMenu';
import type { CalendarEvent } from './types';

function App() {
  const { settings, updateSettings } = useSettings();
  const { events, addEvent, removeEvent } = useEvents();
  const [ showSettings, setShowSettings ] = useState(false);

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
          <ExportMenu events={events} />
        </div>

        {showSettings && (
          <SettingsBar settings={settings} onUpdate={updateSettings} />
        )}
        <EventSummary events={events} totalDays={settings.totalDays} />

        {events.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Events</h2>
            <div className="flex flex-wrap gap-2">
              {events
                .slice()
                .sort((a, b) => a.startDate.localeCompare(b.startDate))
                .map((event) => (
                  <span
                    key={event.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800"
                  >
                    {event.title}: {event.startDate} to {event.endDate}
                    <button
                      onClick={() => removeEvent(event.id)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                      aria-label={`Remove ${event.title}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
            </div>
          </div>
        )}

        <YearCalendar
          yearStartMonth={settings.yearStartMonth}
          year={settings.year}
          events={events}
          onCreateEvent={handleCreateEvent}
        />
      </div>
    </div>
  );
}

export default App;
