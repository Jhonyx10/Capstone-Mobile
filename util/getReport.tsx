import axios from 'axios'

interface ReportParams {
    token: string;
    base_url: string;
}

export const getReports = async ({base_url, token }: ReportParams) => {
    try {
        const response = await axios.get(`${base_url}reports`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.reports
    } catch (error) {
        console.log(error)
        throw error
    }
}