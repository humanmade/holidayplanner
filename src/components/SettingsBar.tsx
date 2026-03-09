import type { AppSettings } from '../types';
import { getMonthName } from '../utils/dates';

interface SettingsBarProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

export function SettingsBar({ settings, onUpdate }: SettingsBarProps) {
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
    </div>
  );
}
