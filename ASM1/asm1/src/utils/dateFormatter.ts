/**
 * Date Formatting Utilities
 * Tiện ích định dạng ngày tháng
 */

/**
 * Format a timestamp into a readable time string
 * Định dạng timestamp thành chuỗi thời gian có thể đọc được
 * 
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted time string (e.g., "14:30" or "Today 14:30")
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Check if it's today
  const isToday = 
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  // Format time
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  if (isToday) {
    return `Hôm nay ${timeString}`;
  } else if (isYesterday) {
    return `Hôm qua ${timeString}`;
  } else {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${timeString}`;
  }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * Lấy chuỗi thời gian tương đối (ví dụ: "2 giờ trước")
 * 
 * @param timestamp - Timestamp in milliseconds
 * @returns Relative time string
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Vừa xong';
  } else if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (hours < 24) {
    return `${hours} giờ trước`;
  } else if (days < 7) {
    return `${days} ngày trước`;
  } else {
    return formatTime(timestamp);
  }
};
