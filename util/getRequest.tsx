import axios from "axios";

interface RequestParams {
    base_url: string;
    token: string;
}

export const getRequest = async ({ base_url, token }: RequestParams) => {
    try {
        const response = await axios.get(`${base_url}request`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.request;
    } catch (error) {
        console.log(error)
        throw error
    }
}