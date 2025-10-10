// Helper functions for Chilean timezone handling across backend routes
// This ensures consistent timezone handling throughout the application

/**
 * Parse dates as Chilean local time instead of UTC
 * The frontend sends ISO strings but they represent Chilean local time, not UTC
 * @param {string} isoString - ISO datetime string from frontend
 * @returns {Date} Date object correctly parsed for Chilean timezone
 */
export function parseChileanDateTime(isoString) {
  // Remove the 'Z' and any timezone suffix, then parse as local time
  const cleanString = isoString.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
  
  // Parse date components manually to avoid UTC interpretation
  const [datePart, timePart] = cleanString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number);
  
  // Create a Date object in local timezone, then convert to what it should be in Chilean time
  // This creates the date as if we're in Chilean timezone
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Get current time in Chilean timezone
 * @returns {Date} Current Chilean time as UTC date object
 */
export function getChileanTime() {
  const now = new Date();
  const CHILE_TIMEZONE = 'America/Santiago';
  
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

  const parts = fmt.formatToParts(now).reduce((acc, part) => {
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
 * Log datetime information for debugging
 * @param {string} label - Label for the log
 * @param {Date} date - Date to log
 */
export function logDateTimeDebug(label, date) {
  console.log(`[${label}] UTC: ${date.toISOString()}, Santiago: ${date.toLocaleString('es-CL', { timeZone: 'America/Santiago' })}`);
}