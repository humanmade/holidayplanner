import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';

const STORAGE_KEY = 'holiday-planner-settings';

const defaultSettings: AppSettings = {
  totalDays: 35,
  yearStartMonth: 3, // April
  year: new Date().getFullYear(),
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return { settings, updateSettings };
}
