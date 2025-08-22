import { IncidentType } from "./IncidentType";
import { Location } from "./LocationType";
import { Evidence } from "./Evidence";

export type Report = {
    id: number;
    incident_type_id?: number;
    date?: string;
    time?: string;
    location_id?: number;
    report_description?: string;
    user_id?: number;
    incident_type?: IncidentType;
    location?: Location;
    evidences?: Evidence[];
    };