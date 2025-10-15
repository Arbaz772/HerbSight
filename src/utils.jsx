export function createPageUrl(page) {
  if (!page) return '/';
  
  // Clean the page string, e.g., lowercase and replace spaces
  const slug = page.trim().toLowerCase().replace(/\s+/g, '-');
  
  return `/${slug}`;
}

export function capitalizeFirstLetter(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Formats a date object to a readable string: "YYYY-MM-DD"
export function formatDate(date) {
  if (!(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Checks if a value is null or undefined
export function isNil(value) {
  return value === null || value === undefined;
}
