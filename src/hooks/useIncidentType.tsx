import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../store/useAppStore";
import { getIncidentTypes } from "../../util/getIncidentType";

const useIncidentType = () => {
    const { base_url, token } = useAppStore()

    return useQuery({
        queryKey: ['incident_type'],
        queryFn: () => getIncidentTypes({base_url, token})
    })
}

export default useIncidentType