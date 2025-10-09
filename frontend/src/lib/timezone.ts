// Utility functions for Chile timezone handling
// Chile uses America/Santiago timezone
// CAMBIOS DE HORARIO EN CHILE:
// - Horario de Invierno (UTC-4): Primer sábado de abril - relojes se atrasan 1 hora
// - Horario de Verano (UTC-3): Primer sábado de septiembre - relojes se adelantan 1 hora

const CHILE_TIMEZONE = 'America/Santiago';

/**
 * Create a date from local date and time inputs (avoids timezone issues)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {Date} Date object in local timezone
 */
export function createLocalDateTime(dateStr: string, timeStr: string): Date {
  // Parse date and time components
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date in local timezone (avoids UTC conversion issues)
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Get today's date in YYYY-MM-DD format for input fields (in Chile timezone)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const chileToday = getChileTime();
  return chileToday.toISOString().split('T')[0];
}

/**
 * Get current Chile timezone offset in hours
 * @returns {number} Current offset (UTC-3 in summer, UTC-4 in winter)
 */
export function getChileOffset(): number {
  const now = new Date();
  
  // Get UTC time and Chile time
  const utcTime = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
  const chileTime = new Date(now.toLocaleString("en-US", {timeZone: CHILE_TIMEZONE}));
  
  // Calculate difference in hours
  const offsetMs = chileTime.getTime() - utcTime.getTime();
  const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));
  
  return offsetHours;
}

/**
 * Check if Chile is currently in summer time (DST)
 * @returns {boolean} True if in summer time (UTC-3), false if in winter time (UTC-4)
 */
export function isChileSummerTime(): boolean {
  const offset = getChileOffset();
  return offset === -3; // Summer time is UTC-3
}

/**
 * Get the current season in Chile based on DST
 * @returns {string} "Verano" or "Invierno"
 */
export function getChileSeason(): string {
  return isChileSummerTime() ? "Verano" : "Invierno";
}

/**
 * Get DST transition dates for Chile for a given year
 * @param {number} year - The year to get transition dates for
 * @returns {object} Object with summer and winter transition dates
 */
export function getChileDSTTransitions(year: number): { summerStart: Date; winterStart: Date } {
  // Find first Saturday of September (summer starts)
  const septFirst = new Date(year, 8, 1); // September 1st
  const septFirstSaturday = new Date(year, 8, 1 + (6 - septFirst.getDay()) % 7);
  
  // Find first Saturday of April (winter starts)
  const aprilFirst = new Date(year, 3, 1); // April 1st
  const aprilFirstSaturday = new Date(year, 3, 1 + (6 - aprilFirst.getDay()) % 7);
  
  return {
    summerStart: septFirstSaturday,
    winterStart: aprilFirstSaturday
  };
}

/**
 * Get current date/time in Chile timezone
 * @returns {Date} Current date in Chile timezone
 */
export function getChileTime(): Date {
  // Safer approach: use Intl.DateTimeFormat.formatToParts to build the wall-clock components
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(now).reduce((acc: any, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);

  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  return new Date(utcMillis);
}

/**
 * Convert a UTC date to Chile timezone
 * @param {Date} utcDate - Date in UTC
 * @returns {Date} Date converted to Chile timezone
 */
export function toChileTime(utcDate: Date): Date {
  // Convert an UTC date to the corresponding wall-clock in Chile by mapping components
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(utcDate).reduce((acc: any, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);

  const utcMillis = Date.UTC(year, month - 1, day, hour, minute, second);
  return new Date(utcMillis);
}

/**
 * Filter out expired slots based on Chile timezone
 * @param {Array} slots - Array of availability slots
 * @returns {Array} Filtered slots that haven't expired
 */
export function filterActiveSlots<T extends { id: number; start: string; end: string }>(slots: T[]): T[] {
  const now = getChileTime();
  
  return slots.filter(slot => {
    const slotEnd = new Date(slot.end);
    return slotEnd > now;
  });
}

/**
 * Check if a date is in the past (Chile timezone)
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(dateString: string | Date): boolean {
  const now = getChileTime();
  const checkDate = new Date(dateString);
  return checkDate < now;
}

/**
 * Format date to Chile timezone
 * @param {Date} date - Date to format
 * @param {Intl.DateTimeFormatOptions} options - Format options
 * @returns {string} Formatted date string
 */
export function formatChileDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleDateString('es-CL', { 
    timeZone: CHILE_TIMEZONE,
    ...options 
  });
}

/**
 * Format time to Chile timezone
 * @param {Date} date - Date to format
 * @param {Intl.DateTimeFormatOptions} options - Format options
 * @returns {string} Formatted time string
 */
export function formatChileTime(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  return date.toLocaleTimeString('es-CL', { 
    timeZone: CHILE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...options 
  });
}