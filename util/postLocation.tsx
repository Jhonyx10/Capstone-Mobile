import axios from "axios";
import { CreateLocation } from "../src/types/LocationType";

interface LocationParams {
    base_url: string;
    token: string;
    formData: CreateLocation;
}

export const postLocation = async ({ base_url, token, formData}: LocationParams) => {
    try {
       const data = new FormData();

       data.append("zone_id", String(formData.zone_id || ""));
       data.append("location_name", formData.location_name || "");
       data.append("latitude", String(formData.latitude || ""));
       data.append("longitude", String(formData.longitude));

       if(formData.landmark) {
         const uri = formData.landmark.startsWith("file://")
        ? formData.landmark
        : `file://${formData.landmark}`;

        const extension = uri.split(".").pop()?.toLowerCase() || "jpg";
        
        const mimeType = extension === "png" ? "image/png" : "image/jpeg";

        data.append("landmark", {
        uri,
        type: mimeType,
        name: `formData.${extension}`,
        } as any);
       }
       
       const response = await axios.post(`${base_url}add-location`,
       formData,
       {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data", 
        },
         transformRequest: () => data,
       })
       return response.data.locations
    } catch (error) {
        console.log(error)
        throw error
    }
}