import axios from "axios";

interface CategoryParams {
    base_url: string;
    token: string;
}

export const getCategories = async ({base_url, token}: CategoryParams) => {
    try {
        const response = await axios.get(`${base_url}get-categories`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.categories
    } catch (error) {
        console.log(error)
        throw error
    }
}