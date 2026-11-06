import axios from 'axios';

export interface SightingPayload {
  subject_id: number;
  latitude: number;
  longitude: number;
  location: string;
  note?: string;
}

export const postSightingReport = async ({
  base_url,
  token,
  payload,
}: {
  base_url: string;
  token: string | null;
  payload: SightingPayload;
}) => {
  const res = await axios.post(`${base_url}sighting-reports`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      // makes Laravel answer validation failures with JSON (422) instead of a redirect
      Accept: 'application/json',
    },
  });
  return res.data;
};