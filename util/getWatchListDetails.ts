import type { WatchListDetail } from '../src/types/WatchListType';

interface Params {
  base_url: string;
  token: string | null;
  watch_list_id: number;
}

// Adjust to match getOperationDetails (axios, shared client, etc.) if it differs.
export const getWatchListDetails = async ({
  base_url,
  token,
  watch_list_id,
}: Params): Promise<WatchListDetail> => {
  const res = await fetch(`${base_url}watch-lists/${watch_list_id}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Watch list request failed (${res.status})`);
  const json = await res.json();
  return json.data;
};