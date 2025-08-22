import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../store/useAppStore";
import { getLocations } from "../../util/getLocation";

const useLocations = () => {
    const { base_url, token } = useAppStore()

    return useQuery({
        queryKey: ['locations'],
        queryFn: () => getLocations({base_url, token})
    })
}

export default useLocations