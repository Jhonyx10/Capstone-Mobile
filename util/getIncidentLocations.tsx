import axios from 'axios';

interface IncidentLocationParams {
  base_url: string;
  token: string;
}

export const getIncidentLocations = async ({
  base_url,
  token,
}: IncidentLocationParams) => {
  try {
    const response = await axios.get(`${base_url}get-locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = response.data;

    // TEMP: shows the real response shape in Metro. Remove once the key is confirmed.
    console.log('get-locations response:', JSON.stringify(body)?.slice(0, 500));

    // React Query throws if the query function returns undefined, so always
    // return an array. The fallbacks cover a few common Laravel shapes.
    const list =
      body?.incident_locations ??
      body?.locations ??
      body?.data ??
      (Array.isArray(body) ? body : []);

    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
