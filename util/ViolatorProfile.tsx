import axios from "axios";
import { CreateViolator } from "../src/types/ViolatorType";

interface ViolatorParams {
  token: string;
  base_url: string;
  violator: CreateViolator;
}

export const postViolator = async ({ token, base_url, violator }: ViolatorParams) => {
  try {
    const formData = new FormData();

    formData.append("last_name", violator.last_name || "");
    formData.append("first_name", violator.first_name || "");
    formData.append("age", String(violator.age || ""));
    formData.append("zone_id", String(violator.zone_id || ""));
    formData.append("address", violator.address || ""); 

    if (violator.photo) {
    const uri = violator.photo.startsWith("file://")
        ? violator.photo
        : `file://${violator.photo}`;

    const extension = uri.split(".").pop()?.toLowerCase() || "jpg";
    
    const mimeType = extension === "png" ? "image/png" : "image/jpeg";


    formData.append("photo", {
        uri,
        type: mimeType,
        name: `violator.${extension}`,
    } as any);
    }

    const response = await axios.post(
      `${base_url}create-violators-profile`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
            "Content-Type": "multipart/form-data", 
        },
         transformRequest: () => formData,
      }
    );

    return response.data.violator;
  } catch (error: any) {
    console.log("Upload error:", error.response?.data || error.message);
    throw error;
  }
};
