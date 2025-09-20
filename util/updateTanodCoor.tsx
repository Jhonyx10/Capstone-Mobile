import axios from "axios";

interface TanodCoordinateParams {
  base_url: string;
  token: string;
  latitude: number;
  longitude: number;
}

export const updateTanodLocation = async ({
  base_url,
  token,
  latitude,
  longitude,
}: TanodCoordinateParams) => {
  try {
    const response = await axios.post(
      `${base_url}tanod/location`,
      {
        latitude,
        longitude,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
          console.log("Posting to:", `${base_url}tanod/location`);
    return response.data;
  } catch (error: any) {
    console.error("Error updating tanod location:", error.response?.data || error.message);
    throw error;
  }
};
