import axios from 'axios';

interface ReportDetailsParams {
  token: string;
  base_url: string;
  report_id: number;
}

export const getReportDetails = async ({
  base_url,
  token,
  report_id,
}: ReportDetailsParams) => {
  try {
    const response = await axios.get(`${base_url}report-details/${report_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // The API wraps the report: { report_details: {...} }. It's null when the
    // id doesn't exist. React Query rejects `undefined`, so always return null
    // instead. (A bare report object is accepted too, in case the controller
    // ever returns it unwrapped.)
    const body = response.data;
    return body?.report_details ?? (body?.id ? body : null);
  } catch (error) {
    console.log(error);
    throw error;
  }
};