import { useState, useEffect } from 'react';
import type { CalendarEvent } from '../types';

const STORAGE_KEY = 'holiday-planner-events';

function loadEvents(): CalendarEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  return { events, addEvent, removeEvent, updateEvent };
}
