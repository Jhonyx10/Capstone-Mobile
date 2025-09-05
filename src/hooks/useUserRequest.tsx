import useAppStore from "../../store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { getUserRequest } from "../../util/getUserRequest";

const useUserRequest = () => {
  const { user, base_url, token } = useAppStore();

  return useQuery({
    queryKey: ["user-request", user?.id], 
    queryFn: () =>
      getUserRequest({
        base_url,
        token,
        userId: user?.id, 
      }),
      enabled: !!user?.id && !!token,
  });
};

export default useUserRequest;
