/**
 * Formats a number as a human-readable string with abbreviated suffixes (K, M, B, T).
 * @param number The number to format
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted string
 */
export const formatNumber = (number: number, decimals = 1): string => {
  if (number === 0) return '0';
  
  const k = 1000;
  const sizes = ['', 'K', 'M', 'B', 'T'];
  
  const i = Math.floor(Math.log(Math.abs(number)) / Math.log(k));
  if (i >= sizes.length) return number.toFixed(decimals);
  
  return (number / Math.pow(k, i)).toFixed(decimals).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + sizes[i];
};

/**
 * Formats a timestamp as a date string.
 * @param timestamp Timestamp in milliseconds
 * @param format Format style ('full', 'date', 'time', 'relative')
 * @returns Formatted date string
 */
export const formatDate = (
  timestamp: number,
  format: 'full' | 'date' | 'time' | 'relative' = 'full'
): string => {
  const date = new Date(timestamp);
  
  if (format === 'relative') {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }
  
  if (format === 'date') {
    return date.toLocaleDateString();
  }
  
  if (format === 'time') {
    return date.toLocaleTimeString();
  }
  
  return date.toLocaleString();
};

/**
 * Truncates a string to a specified length with an ellipsis.
 * @param str The string to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Formats a blockchain address with middle truncation.
 * @param address The blockchain address
 * @param prefixLength Length of prefix to keep (default: 6)
 * @param suffixLength Length of suffix to keep (default: 4)
 * @returns Formatted address string
 */
export const formatAddress = (
  address: string,
  prefixLength = 6,
  suffixLength = 4
): string => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
};