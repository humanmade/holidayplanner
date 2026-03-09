import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent, HolidaySource } from '../types';

const OPEN_HOLIDAYS_BASE = 'https://openholidaysapi.org';
const NAGER_BASE = 'https://date.nager.at/api/v3';

interface OpenHolidayResponse {
  id: string;
  startDate: string;
  endDate: string;
  name: { language: string; text: string }[];
  nationwide: boolean;
}

interface NagerHolidayResponse {
  date: string;
  name: string;
  localName: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  types: string[];
}

interface CacheEntry {
  key: string;
  holidays: CalendarEvent[];
}

function getEnglishName(names: { language: string; text: string }[], fallback: string): string {
  const en = names.find((n) => n.language === 'EN');
  return en?.text ?? names[0]?.text ?? fallback;
}

function computeDateRange(year: number, yearStartMonth: number) {
  const validFrom = `${year}-${String(yearStartMonth + 1).padStart(2, '0')}-01`;

  let endYear = year;
  let endMonth = yearStartMonth;
  if (yearStartMonth === 0) {
    endYear = year;
    endMonth = 12;
  } else {
    endYear = year + 1;
    endMonth = yearStartMonth;
  }
  const lastDay = new Date(endYear, endMonth, 0).getDate();
  const validTo = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { validFrom, validTo };
}

function calendarYearsForRange(year: number, yearStartMonth: number): number[] {
  if (yearStartMonth === 0) return [year];
  return [year, year + 1];
}

async function fetchOpenHolidays(
  countryCode: string,
  subdivisionCode: string,
  year: number,
  yearStartMonth: number,
): Promise<CalendarEvent[]> {
  const { validFrom, validTo } = computeDateRange(year, yearStartMonth);

  const baseParams = new URLSearchParams({
    countryIsoCode: countryCode,
    languageIsoCode: 'EN',
    validFrom,
    validTo,
  });
  if (subdivisionCode) {
    baseParams.set('subdivisionCode', subdivisionCode);
  }

  const publicRes = await fetch(`${OPEN_HOLIDAYS_BASE}/PublicHolidays?${baseParams}`);
  if (!publicRes.ok) throw new Error(`API error: ${publicRes.status}`);
  const publicData: OpenHolidayResponse[] = await publicRes.json();

  const holidays: CalendarEvent[] = publicData.map((h) => ({
    id: `public-${h.id}-${h.startDate}`,
    startDate: h.startDate,
    endDate: h.endDate,
    title: getEnglishName(h.name, 'Public Holiday'),
    type: 'public' as const,
  }));

  if (subdivisionCode) {
    try {
      const schoolRes = await fetch(`${OPEN_HOLIDAYS_BASE}/SchoolHolidays?${baseParams}`);
      if (schoolRes.ok) {
        const schoolData: OpenHolidayResponse[] = await schoolRes.json();
        for (const h of schoolData) {
          holidays.push({
            id: `school-${h.id}-${h.startDate}`,
            startDate: h.startDate,
            endDate: h.endDate,
            title: getEnglishName(h.name, 'School Holiday'),
            type: 'school' as const,
          });
        }
      }
    } catch {
      // School holidays not available — that's fine
    }
  }

  return holidays;
}

async function fetchNagerHolidays(
  countryCode: string,
  subdivisionCode: string,
  year: number,
  yearStartMonth: number,
): Promise<CalendarEvent[]> {
  const { validFrom, validTo } = computeDateRange(year, yearStartMonth);
  const years = calendarYearsForRange(year, yearStartMonth);

  const responses = await Promise.all(
    years.map(async (y) => {
      const res = await fetch(`${NAGER_BASE}/PublicHolidays/${y}/${countryCode}`);
      if (!res.ok) throw new Error(`Nager API error: ${res.status}`);
      return res.json() as Promise<NagerHolidayResponse[]>;
    })
  );

  const allNager = responses.flat();

  // Filter to fiscal year range and by subdivision
  const filtered = allNager.filter((h) => {
    if (h.date < validFrom || h.date > validTo) return false;
    if (subdivisionCode && !h.global) {
      if (!h.counties?.includes(subdivisionCode)) return false;
    }
    return true;
  });

  const holidays: CalendarEvent[] = [];
  for (const h of filtered) {
    const isSchool = h.types.includes('School') && !h.types.includes('Public');
    holidays.push({
      id: `nager-${h.date}-${h.name}`,
      startDate: h.date,
      endDate: h.date,
      title: h.name,
      type: isSchool ? 'school' : 'public',
    });
  }

  return holidays;
}

export function usePublicHolidays(
  countryCode: string,
  subdivisionCode: string,
  year: number,
  yearStartMonth: number,
  countrySource: HolidaySource,
) {
  const [publicHolidays, setPublicHolidays] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<CacheEntry | null>(null);

  useEffect(() => {
    if (!countryCode || !countrySource) {
      setPublicHolidays([]);
      setLoading(false);
      setError(null);
      return;
    }

    const { validFrom, validTo } = computeDateRange(year, yearStartMonth);
    const cacheKey = `${countrySource}|${countryCode}|${subdivisionCode}|${validFrom}|${validTo}`;

    if (cacheRef.current?.key === cacheKey) {
      return;
    }

    let cancelled = false;

    async function doFetch() {
      setLoading(true);
      setError(null);

      try {
        const holidays = countrySource === 'openholidays'
          ? await fetchOpenHolidays(countryCode, subdivisionCode, year, yearStartMonth)
          : await fetchNagerHolidays(countryCode, subdivisionCode, year, yearStartMonth);

        if (cancelled) return;

        cacheRef.current = { key: cacheKey, holidays };
        setPublicHolidays(holidays);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch holidays');
          setPublicHolidays([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    doFetch();

    return () => {
      cancelled = true;
    };
  }, [countryCode, subdivisionCode, year, yearStartMonth, countrySource]);

  return { publicHolidays, loading, error };
}
