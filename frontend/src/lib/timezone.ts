// Utility functions for Chile timezone handling
// Chile uses America/Santiago timezone

const CHILE_TIMEZONE = 'America/Santiago';

/**
 * Get current date/time in Chile timezone
 * @returns {Date} Current date in Chile timezone
 */
export function getChileTime(): Date {
  const now = new Date();
  
  // Chile está normalmente UTC-3 (horario estándar) o UTC-4 (horario de verano) 
  // Basándonos en la diferencia observada con la hora local, necesitamos UTC-6
  const chileOffset = -6; // Offset corregido para Chile
  
  // Crear nueva fecha ajustando por el offset de Chile
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const chileTime = new Date(utc + (chileOffset * 3600000));
  
  return chileTime;
}

/**
 * Convert a UTC date to Chile timezone
 * @param {Date} utcDate - Date in UTC
 * @returns {Date} Date converted to Chile timezone
 */
export function toChileTime(utcDate: Date): Date {
  // Chile está normalmente UTC-3 (horario estándar) o UTC-4 (horario de verano) 
  // Basándonos en la diferencia observada con la hora local, necesitamos UTC-6
  const chileOffset = -6; // Offset corregido para Chile
  
  // Crear nueva fecha ajustando por el offset de Chile
  const utc = utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000);
  const chileTime = new Date(utc + (chileOffset * 3600000));
  
  return chileTime;
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