import { useState, useRef, useEffect } from 'react';
import type { CalendarEvent } from '../types';
import { exportAsText, exportAsCsv } from '../utils/export';

interface ExportMenuProps {
  events: CalendarEvent[];
}

export function ExportMenu({ events }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const download = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Export
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            onClick={() =>
              download(exportAsText(events), 'holidays.txt', 'text/plain')
            }
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as Text
          </button>
          <button
            onClick={() =>
              download(exportAsCsv(events), 'holidays.csv', 'text/csv')
            }
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
}
