import axios from "axios";

interface LocationParams {
    base_url: string,
    token: string,
}

export const getLocations = async ({base_url, token }: LocationParams) => {
    try {
        const response = await axios.get(`${base_url}get-locations`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.locations
    } catch (error) {
        console.log(error)
        throw error
    }
}