import axios from "axios";
import { RequestResponse } from "../src/types/RequestResponseType";

interface RequestParams {
    base_url: string;
    token: string;
    formData: RequestResponse
}

export const sendRequest = async ({ base_url, token, formData }: RequestParams ) => {
    try {
        const response = await axios.post(`${base_url}send-request`, formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.response
    } catch (error) {
        console.log(error)
        throw error
    }
}