const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Hermes can lack Intl, so dates are formatted by hand
export const timeAgo = (iso: string) => {
  const then = new Date(iso);
  if (isNaN(then.getTime())) return '';

  const mins = Math.max(0, Math.floor((Date.now() - then.getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return `${MONTHS[then.getMonth()]} ${then.getDate()}`;
};

export const isToday = (iso: string) =>
  new Date(iso).toDateString() === new Date().toDateString();

// published within the last 24 hours
export const isNew = (iso: string) => {
  const t = new Date(iso).getTime();
  return !isNaN(t) && Date.now() - t < 24 * 60 * 60 * 1000;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const todayLabel = () => {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
};