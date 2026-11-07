import axios from "axios";

interface Params {
    base_url: string;
    token: string;
}

export const getHotlines = async ({base_url, token}: Params) => {
    try {
        const response = await axios.get(`${base_url}hotline`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.hotlines
    } catch (error) {
        console.log(error)
        throw error
    }
}
