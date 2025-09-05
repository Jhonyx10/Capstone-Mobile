import { useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAppStore from "../../store/useAppStore";

export const useEcho = () => {
  const { base_url } = useAppStore();
  const [echo, setEcho] = useState<Echo<"pusher"> | null>(null);

  useEffect(() => {
    const initEcho = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const echoInstance = new Echo<"pusher">({
        broadcaster: "pusher",
        key: "local",
        wsHost: "10.223.200.34",
        wsPort: 6001,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ["ws"],
        authEndpoint: "http://10.223.200.34/broadcasting/auth",
        auth: {
          headers: { Authorization: `Bearer ${token}` },
        },
        Pusher: Pusher,
      });
      console.log("Token from storage:", token);

      // cast connector to 'any' to access pusher safely
      const pusherConnector = echoInstance.connector as any;

      pusherConnector.pusher.connection.bind("connected", () =>
        console.log("WebSocket connected")
      );
      pusherConnector.pusher.connection.bind("error", (err: any) =>
        console.log("WebSocket error:", err)
      );

      setEcho(echoInstance);
    };

    initEcho();
  }, [base_url]);

  return echo;
};
