import axios from "axios";

interface ReportViolatorsParams {
    base_url: string;
    token: string;
    report_id: number;
}

export const getReportViolators = async ({base_url, token, report_id}: ReportViolatorsParams) => {
    try {
        const response = await axios.get(`${base_url}report-violators/${report_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.report_violators ?? [];
    } catch (error) {
        console.log(error)
        return [];
    }
}