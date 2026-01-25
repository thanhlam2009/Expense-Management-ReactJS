// Format utilities - Copy từ app.js

/**
 * Format currency to Vietnamese Dong
 * Copy từ app.js formatCurrency()
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format number with Vietnamese locale
 * Copy từ app.js formatNumber()
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('vi-VN').format(number);
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return d.toLocaleDateString('vi-VN');
}

/**
 * Format date for input[type="date"]
 */
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}
