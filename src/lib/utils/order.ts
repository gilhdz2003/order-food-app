/**
 * Order utility functions
 */

/**
 * Check if order can be edited (before 11:30 AM Mexico City time)
 */
export function canEditOrder(orderCreatedAt: string): boolean {
  const created = new Date(orderCreatedAt);
  const mexicoCityOffset = 6; // UTC-6 (standard time), UTC-5 (daylight saving)
  const localCreated = new Date(created.getTime() - mexicoCityOffset * 60 * 60 * 1000);

  const deadline = new Date(localCreated);
  deadline.setHours(11, 30, 0, 0);

  return new Date() < deadline;
}

/**
 * Format date for display
 */
export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatOrderTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
