import axios from "axios";

interface UserRequestParams{
    base_url: string;
    token: string;
    userId?: number;
}

export const getUserRequest = async ({ base_url, token, userId }: UserRequestParams) => {
    try {
        const response = await axios.get(`${base_url}user-request/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.request
    } catch (error) {
        console.log(error)
        throw error
    }
}