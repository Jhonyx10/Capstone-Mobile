import axios from "axios";

interface IncidentParams {
    base_url: string;
    token: string;
}

export const getIncidentTypes = async ({base_url, token }: IncidentParams) => {
    try {
        const response = await axios.get(`${base_url}get-incident-types`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.incidentTypes
    } catch (error) {
        console.log(error)
        throw error
    }
}