export type WatchListStatus = 'active' | 'inactive' | 'resolved' | string;

export interface WatchListItem {
  id: number;
  type: 'vehicle' | 'person' | string;
  identifier: string;
  details: string | null;
  image_url: string | null;
  status: WatchListStatus;
  reason: string | null;
  sightings_count: number;
  // shape not confirmed yet (null in the sample): string date or object
  latest_sighting: unknown;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WatchListPage {
  data: WatchListItem[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

/**
 * One sighting from `GET watch-lists/{id}`. The sample had an empty array, so
 * every field except the coordinates is optional and the helper accepts a few
 * likely names. Adjust once you see a real record.
 */
export interface Sighting {
  id: number;
  latitude: number | string | null;
  longitude: number | string | null;
  sighted_at?: string | null;
  created_at?: string | null;
  notes?: string | null;
  location?: string | null;
  user?: { name?: string | null } | null;
}

export interface WatchListDetail
  extends Omit<WatchListItem, 'latest_sighting'> {
  sightings: Sighting[];
}