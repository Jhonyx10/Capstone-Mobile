import axios from "axios";

interface IncidentLocationParams {
    base_url: string;
    token: string;
}

export const getIncidentLocations = async ({ base_url, token }: IncidentLocationParams) => {
    try {
        const response = await axios.get(`${base_url}get-incident-locations`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.incident_locations
    } catch (error) {
        console.log(error)
        throw error
    }
}