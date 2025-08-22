import axios from "axios";

interface ViolatorsDetailsParams {
    base_url: string;
    token: string;
    violators_id: number;
}

export const violatorsDetails = async ({ base_url, token, violators_id}: ViolatorsDetailsParams) => {
    try {
        const response = await axios.get(`${base_url}violator-details/${violators_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.violator
    } catch (error) {
        console.log(error)
        throw error
    }
}