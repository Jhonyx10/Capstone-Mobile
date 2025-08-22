import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../store/useAppStore";
import { getZones } from "../../util/Zone";

const useZones = () => {
    const { token, base_url } = useAppStore();

    return useQuery({
        queryKey: ['zones'],
        queryFn: () => getZones({token, base_url}),
    })
}
export default useZones