import axios from 'axios';

interface LoginParams {
  base_url: string;
  name: string;
  password: string;
}

export const Login = async ({base_url, name, password}: LoginParams) => {
    try {
        const response = await axios.post(`${base_url}login`, {name, password})
        return response.data
    } catch (error) {
        console.log(error)
        throw error;
    }
}