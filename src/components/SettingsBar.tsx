import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { getMonthName } from '../utils/dates';

const API_BASE = 'https://openholidaysapi.org';

interface ApiName {
  language: string;
  text: string;
}

interface Country {
  isoCode: string;
  name: ApiName[];
}

interface Subdivision {
  code: string;
  name: ApiName[];
}

function getEnglishName(names: ApiName[]): string {
  return names.find((n) => n.language === 'EN')?.text ?? names[0]?.text ?? '';
}

interface SettingsBarProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

export function SettingsBar({ settings, onUpdate }: SettingsBarProps) {
  const [countries, setCountries] = useState<{ code: string; name: string }[]>([]);
  const [subdivisions, setSubdivisions] = useState<{ code: string; name: string }[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingSubdivisions, setLoadingSubdivisions] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingCountries(true);

    fetch(`${API_BASE}/Countries`)
      .then((res) => res.json())
      .then((data: Country[]) => {
        if (cancelled) return;
        const sorted = data
          .map((c) => ({ code: c.isoCode, name: getEnglishName(c.name) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
      })
      .catch(() => {
        // silently fail — dropdown will just be empty
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Fetch subdivisions when country changes
  useEffect(() => {
    setSubdivisions([]);

    if (!settings.countryCode) return;

    let cancelled = false;
    setLoadingSubdivisions(true);

    fetch(`${API_BASE}/Subdivisions?countryIsoCode=${settings.countryCode}`)
      .then((res) => res.json())
      .then((data: Subdivision[]) => {
        if (cancelled) return;
        const sorted = data
          .map((s) => ({ code: s.code, name: getEnglishName(s.name) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setSubdivisions(sorted);
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => {
        if (!cancelled) setLoadingSubdivisions(false);
      });

    return () => { cancelled = true; };
  }, [settings.countryCode]);

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2">
        <label htmlFor="totalDays" className="text-sm font-medium text-gray-700">
          Holiday allowance
        </label>
        <input
          id="totalDays"
          type="number"
          min={0}
          max={365}
          value={settings.totalDays}
          onChange={(e) => onUpdate({ totalDays: parseInt(e.target.value) || 0 })}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-500">days</span>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="yearStart" className="text-sm font-medium text-gray-700">
          Year starts
        </label>
        <select
          id="yearStart"
          value={settings.yearStartMonth}
          onChange={(e) => onUpdate({ yearStartMonth: parseInt(e.target.value) })}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {getMonthName(i)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="year" className="text-sm font-medium text-gray-700">
          Year
        </label>
        <input
          id="year"
          type="number"
          min={2000}
          max={2100}
          value={settings.year}
          onChange={(e) => onUpdate({ year: parseInt(e.target.value) || new Date().getFullYear() })}
          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="country" className="text-sm font-medium text-gray-700">
          Public holidays
        </label>
        <select
          id="country"
          value={settings.countryCode}
          onChange={(e) => onUpdate({ countryCode: e.target.value, subdivisionCode: '' })}
          disabled={loadingCountries}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {settings.countryCode && subdivisions.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="subdivision" className="text-sm font-medium text-gray-700">
            Region
          </label>
          <select
            id="subdivision"
            value={settings.subdivisionCode}
            onChange={(e) => onUpdate({ subdivisionCode: e.target.value })}
            disabled={loadingSubdivisions}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All (national only)</option>
            {subdivisions.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
