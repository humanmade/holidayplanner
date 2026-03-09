import { useState, useEffect } from 'react';
import type { AppSettings, HolidaySource } from '../types';
import { getMonthName } from '../utils/dates';

const OPEN_HOLIDAYS_BASE = 'https://openholidaysapi.org';
const NAGER_BASE = 'https://date.nager.at/api/v3';

interface ApiName {
  language: string;
  text: string;
}

interface OpenHolidaysCountry {
  isoCode: string;
  name: ApiName[];
}

interface NagerCountry {
  countryCode: string;
  name: string;
}

interface Subdivision {
  code: string;
  name: ApiName[];
}

interface CountryEntry {
  code: string;
  name: string;
  source: HolidaySource;
}

function getEnglishName(names: ApiName[]): string {
  return names.find((n) => n.language === 'EN')?.text ?? names[0]?.text ?? '';
}

interface SettingsBarProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

export function SettingsBar({ settings, onUpdate }: SettingsBarProps) {
  const [countries, setCountries] = useState<CountryEntry[]>([]);
  const [subdivisions, setSubdivisions] = useState<{ code: string; name: string }[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingSubdivisions, setLoadingSubdivisions] = useState(false);

  // Fetch and merge country lists from both APIs
  useEffect(() => {
    let cancelled = false;
    setLoadingCountries(true);

    const openHolidaysPromise = fetch(`${OPEN_HOLIDAYS_BASE}/Countries`)
      .then((res) => res.json())
      .then((data: OpenHolidaysCountry[]) =>
        data.map((c) => ({ code: c.isoCode, name: getEnglishName(c.name), source: 'openholidays' as const }))
      )
      .catch(() => [] as CountryEntry[]);

    const nagerPromise = fetch(`${NAGER_BASE}/AvailableCountries`)
      .then((res) => res.json())
      .then((data: NagerCountry[]) =>
        data.map((c) => ({ code: c.countryCode, name: c.name, source: 'nager' as const }))
      )
      .catch(() => [] as CountryEntry[]);

    Promise.all([openHolidaysPromise, nagerPromise])
      .then(([openCountries, nagerCountries]) => {
        if (cancelled) return;

        // OpenHolidays takes priority — only add Nager countries not already covered
        const openCodes = new Set(openCountries.map((c) => c.code));
        const merged = [
          ...openCountries,
          ...nagerCountries.filter((c) => !openCodes.has(c.code)),
        ];
        merged.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(merged);
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Fetch subdivisions when country changes (OpenHolidays only)
  useEffect(() => {
    setSubdivisions([]);

    if (!settings.countryCode || settings.countrySource !== 'openholidays') return;

    let cancelled = false;
    setLoadingSubdivisions(true);

    fetch(`${OPEN_HOLIDAYS_BASE}/Subdivisions?countryIsoCode=${settings.countryCode}`)
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
  }, [settings.countryCode, settings.countrySource]);

  const handleCountryChange = (code: string) => {
    const country = countries.find((c) => c.code === code);
    onUpdate({
      countryCode: code,
      subdivisionCode: '',
      countrySource: country?.source ?? '',
    });
  };

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
          onChange={(e) => handleCountryChange(e.target.value)}
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
