import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../store/useAppStore";
import { getRequest } from "../../util/getRequest";

const getRequestResponse = () => {
    const { base_url, token } = useAppStore()

    return useQuery({
        queryKey:['request'],
        queryFn: () => getRequest({base_url, token})
    })
}

export default getRequestResponse