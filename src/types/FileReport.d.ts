import { Evidence } from "./Evidence";
import { Violator } from "./ViolatorType";

export type FileReport = {
  incident_type_id: string;
  date: string;
  time: string;
  location_id: string;
  report_description: string;
  user_id: number | undefined;
  evidence: Evidence[]; 
  violators: Violator[];
  request_id: number | null;
  distance: number | null;
  response_time: number | null;
};