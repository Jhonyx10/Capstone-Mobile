import axios from "axios";

interface LogoutParams {
    token: string;
    base_url: string;
}

export const Logout = async ({base_url, token}: LogoutParams) => {
    try {
        const response = await axios.post(`${base_url}logout`, {},{
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        return response.data
    } catch (error) {
        console.log(error);
        throw error;
    }
}