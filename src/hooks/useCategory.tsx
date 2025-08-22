import { useQuery } from "@tanstack/react-query";
import useAppStore from "../../store/useAppStore";
import { getCategories } from "../../util/Category";

const useCategories = () => {
    const { token, base_url } = useAppStore()

    return useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories({base_url, token}),
    })
}

export default useCategories