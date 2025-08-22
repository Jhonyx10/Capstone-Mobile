import axios from "axios";
import { FileReport } from "../src/types/FileReport";

interface FileReportParams {
  base_url: string;
  token: string;
  formData: FileReport;
}

export const fileReport = async ({ base_url, token, formData }: FileReportParams) => {
  try {
    const data = new FormData();
    const date = new Date();
    const formattedTime = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

    data.append("incident_type_id", formData.incident_type_id);
    data.append("date", formData.date);
    data.append("time", formattedTime);
    data.append("location_id", formData.location_id);
    data.append("report_description", formData.report_description);
    data.append("user_id", String(formData.user_id));

    formData.evidence.forEach((ev, index) => {
      data.append("incident_evidence[]", {
        uri: ev.incident_evidence.startsWith("file://")
          ? ev.incident_evidence
          : "file://" + ev.incident_evidence,
        type: "image/jpeg",
        name: `photo_${index}.jpg`,
      } as any);
    });

    formData.violators.forEach((v, index) => {
      data.append(`violator_id[${index}]`, String(v.id));
    });

    const response = await axios.post(`${base_url}file-report`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 422) {
    console.log("Validation errors:", error.response.data.errors);
  } else {
    console.log("Error filing report:", error.message);
  }
  }
};
