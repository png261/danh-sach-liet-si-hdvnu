import { LunarCalendar } from '@dqcai/vn-lunar';

/**
 * Converts a Gregorian date string (e.g., "20/07/1972" or "20-07-1972") to Vietnamese Lunar Date string.
 * Returns null if the conversion fails or input is invalid.
 */
export function getVietnameseLunarDateString(gregorianDateStr: string | null | undefined): string | null {
  if (!gregorianDateStr) return null;

  // Clean the string and extract date parts
  const cleanStr = gregorianDateStr.trim();
  const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const match = cleanStr.match(dateRegex);
  
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  try {
    const cal = LunarCalendar.fromSolar(day, month, year);
    const ld = cal.lunarDate;
    const leapStr = ld.leap ? " (nhuận)" : "";
    return `${ld.day}/${ld.month}${leapStr} Âm lịch, năm ${cal.yearCanChi}`;
  } catch (error) {
    console.error("Error converting solar to lunar date:", error);
    return null;
  }
}
