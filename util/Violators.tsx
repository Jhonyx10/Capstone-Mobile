import axios from "axios";

interface ViolatorsParams {
    token: string;
    base_url: string;
}

export const getViolators = async ({base_url, token }: ViolatorsParams) => {
    try {
        const response = await axios.get(`${base_url}get-violators`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        return response.data.violators
    } catch (error) {
        console.log(error)
        throw error
    }
}