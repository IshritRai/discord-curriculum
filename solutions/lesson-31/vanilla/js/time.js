// Formatting dates and times the way the chat app shows them.

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
const shortDateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });

export function isSameDay(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function minutesBetween(a, b) {
  const milliseconds = new Date(b).getTime() - new Date(a).getTime();
  return Math.abs(milliseconds) / 60000;
}

// "3:41 PM"
export function formatTime(timestamp) {
  return timeFormat.format(new Date(timestamp));
}

// "October 13, 2026"
export function formatDate(timestamp) {
  return dateFormat.format(new Date(timestamp));
}

// "Today at 3:41 PM", "Yesterday at 9:02 AM" or "10/11/2026 9:02 AM"
export function formatTimestamp(timestamp) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(timestamp, now)) {
    return `Today at ${formatTime(timestamp)}`;
  }
  if (isSameDay(timestamp, yesterday)) {
    return `Yesterday at ${formatTime(timestamp)}`;
  }
  return `${shortDateFormat.format(new Date(timestamp))} ${formatTime(timestamp)}`;
}
