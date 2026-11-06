import type { WatchListPage } from '../src/types/WatchListType';

interface Params {
  base_url: string;
  token: string | null;
  page?: number;
}

// Adjust to match getOperations (axios, shared client, etc.) if it differs.
export const getWatchLists = async ({
  base_url,
  token,
  page = 1,
}: Params): Promise<WatchListPage> => {
  const res = await fetch(`${base_url}watch-lists?page=${page}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Watch list request failed (${res.status})`);
  return res.json();
};