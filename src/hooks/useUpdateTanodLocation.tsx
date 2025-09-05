import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useAppStore from "../../store/useAppStore";

export const useUpdateTanodLocation = () => {
  const { base_url, token, user } = useAppStore();

  return useMutation({
    mutationFn: async ({
      request_id,
      latitude,
      longitude,
    }: { request_id: number; latitude: number; longitude: number }) => {
      if (!user?.id) throw new Error("User ID is not defined");

      const res = await axios.post(
        `${base_url}tanod/location`,
        {
          request_id,
          tanod_id: user.id, // use user.id here
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    },
  });
};

