import type { Sighting } from '../src/types/WatchListType';

export interface SightingPoint {
  id: number;
  lat: number;
  lng: number;
  at: string | null;
  note: string | null;
  place: string | null;
  by: string | null;
  /** 1 = first time it was seen */
  n: number;
  latest: boolean;
}

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

const when = (s: Sighting) => s.sighted_at ?? s.created_at ?? null;
const ms = (v: string | null) => {
  const t = v ? Date.parse(v) : NaN;
  return Number.isFinite(t) ? t : 0;
};

/** Valid sightings only, numbered oldest to newest, returned newest first. */
export const normalizeSightings = (raw: Sighting[] = []): SightingPoint[] => {
  const valid = raw
    .filter(s => s.latitude != null && s.longitude != null)
    .map(s => ({ s, lat: Number(s.latitude), lng: Number(s.longitude) }))
    .filter(x => Number.isFinite(x.lat) && Number.isFinite(x.lng));

  const asc = [...valid].sort((a, b) => ms(when(a.s)) - ms(when(b.s)));

  return asc
    .map(
      ({ s, lat, lng }, i): SightingPoint => ({
        id: s.id,
        lat,
        lng,
        at: when(s),
        note: s.notes ?? null,
        place: s.location ?? null,
        by: s.user?.name ?? null,
        n: i + 1,
        latest: i === asc.length - 1,
      }),
    )
    .reverse();
};

export const formatDateTime = (value: string | null) => {
  if (!value) return 'Time not recorded';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'Time not recorded';
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${hour}:${m} ${
    h < 12 ? 'AM' : 'PM'
  }`;
};

export const timeAgo = (value: string | null) => {
  const t = ms(value);
  if (!t) return null;
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return formatDateTime(value).split(' at ')[0];
};