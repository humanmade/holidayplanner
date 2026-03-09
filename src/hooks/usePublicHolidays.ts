import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../types';

const API_BASE = 'https://openholidaysapi.org';

interface HolidayApiResponse {
  id: string;
  startDate: string;
  endDate: string;
  name: { language: string; text: string }[];
  nationwide: boolean;
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
  let endMonth = yearStartMonth; // the month before the start month next year
  if (yearStartMonth === 0) {
    endYear = year;
    endMonth = 12;
  } else {
    endYear = year + 1;
    endMonth = yearStartMonth;
  }
  // Last day of the month before the next fiscal year start
  const lastDay = new Date(endYear, endMonth, 0).getDate();
  const validTo = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { validFrom, validTo };
}

export function usePublicHolidays(
  countryCode: string,
  subdivisionCode: string,
  year: number,
  yearStartMonth: number
) {
  const [publicHolidays, setPublicHolidays] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<CacheEntry | null>(null);

  useEffect(() => {
    if (!countryCode) {
      setPublicHolidays([]);
      setLoading(false);
      setError(null);
      return;
    }

    const { validFrom, validTo } = computeDateRange(year, yearStartMonth);
    const cacheKey = `${countryCode}|${subdivisionCode}|${validFrom}|${validTo}`;

    if (cacheRef.current?.key === cacheKey) {
      return;
    }

    let cancelled = false;

    async function fetchHolidays() {
      setLoading(true);
      setError(null);

      try {
        const baseParams = new URLSearchParams({
          countryIsoCode: countryCode,
          languageIsoCode: 'EN',
          validFrom,
          validTo,
        });
        if (subdivisionCode) {
          baseParams.set('subdivisionCode', subdivisionCode);
        }

        // Always fetch public holidays
        const publicRes = await fetch(`${API_BASE}/PublicHolidays?${baseParams}`);
        if (!publicRes.ok) {
          throw new Error(`API error: ${publicRes.status}`);
        }
        const publicData: HolidayApiResponse[] = await publicRes.json();
        if (cancelled) return;

        const holidays: CalendarEvent[] = publicData.map((h) => ({
          id: `public-${h.id}-${h.startDate}`,
          startDate: h.startDate,
          endDate: h.endDate,
          title: getEnglishName(h.name, 'Public Holiday'),
          type: 'public' as const,
        }));

        // Fetch school holidays if a subdivision is selected (required by the API)
        if (subdivisionCode) {
          try {
            const schoolRes = await fetch(`${API_BASE}/SchoolHolidays?${baseParams}`);
            if (schoolRes.ok) {
              const schoolData: HolidayApiResponse[] = await schoolRes.json();
              if (!cancelled) {
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
            }
          } catch {
            // School holidays not available for this country/subdivision — that's fine
          }
        }

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

    fetchHolidays();

    return () => {
      cancelled = true;
    };
  }, [countryCode, subdivisionCode, year, yearStartMonth]);

  return { publicHolidays, loading, error };
}
