import axios from "axios";

interface ZoneParams {
    token: string;
    base_url: string;
}

export const getZones = async ({token, base_url}: ZoneParams) => {
    try {
        const response = await axios.get(`${base_url}get-zones`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.zones
    } catch (error) {
        console.log(error)
        throw error
    }
}